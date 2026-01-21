const cheerio = require('cheerio');

async function inspectHeaders() {
    console.log("Fetching headers...");
    const response = await fetch('https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch?programSeviyeTipiAnahtari=LS&dersBransKoduId=3', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://obs.itu.edu.tr/public/DersProgram',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const text = await response.text();
    const $ = cheerio.load(text);

    const headers = [];
    $('.table-baslik td').each((i, el) => {
        headers.push({ index: i, text: $(el).text().trim() });
    });

    console.log("Headers:", headers);
}

inspectHeaders();
