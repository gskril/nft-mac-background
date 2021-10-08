const fs = require("fs")
const inquirer = require("inquirer")
const wallpaper = require("wallpaper")
const axios = require("axios").default
const { createCanvas, loadImage } = require("canvas")

inquirer
	.prompt([
		{
			name: "wallet",
			type: "input",
			message: "Enter your wallet address:",
			validate: (answer) => {
				if (answer.length !== 42 || !answer.startsWith("0x")) {
					return 'Enter your ETH wallet address starting with "0x"'
				} else {
					return true
				}
			},
		},
		{
			name: "color",
			message: "Background Color",
			type: "list",
			choices: ["White", "Black"],
		},
	])
	.then((answers) => {
		start(answers.wallet, answers.color)
	})
	.catch((err) => {
		console.log(err)
	})

async function start(wallet, color) {
	const options = {
		method: "GET",
		url: `https://api.opensea.io/api/v1/assets?owner=${wallet}&order_direction=desc&offset=0&limit=20`,
	}

	// Fetch assets from OpenSea profile
	axios
		.request(options)
		.then(function (res) {
			const assets = res.data.assets
			assets.forEach((nft) => {
				// Get image in higher quality (height of 800px)
				const imageUrl = nft.image_url + "=h800"
				// Save images, ignore videos
				if (!imageUrl.includes(".mp4")) {
					// Use canvas to create border around NFT so it fits on the screen
					const canvas = createCanvas(1920, 1080)
					const ctx = canvas.getContext("2d")

					// Set background color based on command line selection
					color === "White"
						? (ctx.fillStyle = "#fff")
						: (ctx.fillStyle = "#000")
					ctx.fillRect(0, 0, canvas.width, canvas.height)

					loadImage(imageUrl).then((image) => {
						// Center image in canvas
						ctx.drawImage(
							image,
							canvas.width / 2 - image.width / 2,
							canvas.height / 2 - image.height / 2
						)

						let base64Image = canvas
							.toDataURL()
							.split(";base64,")
							.pop()
						let fileName = "nfts/" + nft.id + ".jpg"
						fs.writeFile(
							fileName,
							base64Image,
							{
								encoding: "base64",
							},
							function (err) {
								console.log(fileName + " created")
							}
						)
					})
				}
			})
		})
		.catch(function (error) {
			console.error('Can\'t find wallet')
			process.exit()
		})

	// Set desktop wallpaper to folder
	await wallpaper.set("nfts")
}
