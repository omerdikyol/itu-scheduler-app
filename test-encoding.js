const cheerio = require('cheerio');

async function testFetch() {
    console.log("Fetching...");
    const response = await fetch('https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch?programSeviyeTipiAnahtari=LS&dersBransKoduId=3', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://obs.itu.edu.tr/public/DersProgram',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    const text = await response.text();
    const $ = cheerio.load(text);

    let found = false;
    $('tr').each((i, row) => {
        if (found) return;
        const cols = $(row).find('td');
        if (cols.length > 6) {
            const dayCell = $(cols[6]);
            const dayText = dayCell.text().trim();

            if (dayText.includes('Sal') || dayText.includes('Per')) {
                console.log(`Row ${i} Day HTML:`, dayCell.html());
                console.log(`Row ${i} Day Text: "${dayText}"`);
                found = true;
            }
        }
    });
}

testFetch();
