/**
 * Create a PDF file using puppeteer
 */
import path from 'path'
import puppeteer from 'puppeteer'
import { status } from '../common/log'

export default async function (config) {
  const pdf = path.join(config.destination, 'print.pdf')
  const html = `file://${path
    .resolve(config.destination, 'print.html')
    .replace(/\\/g, '/')
    .replace(/^([^/])/, '/$1')}`

  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  await page.goto(html, { waitUntil: 'networkidle2' })

  status('Writing print.pdf')

  await page.pdf({
    format: 'A4',
    path: pdf,
    printBackground: true
  })

  await browser.close()
}
