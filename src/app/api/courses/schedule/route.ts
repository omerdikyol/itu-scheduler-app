import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get('branchId');
  const level = searchParams.get('level') || 'LS';
  
  if (!branchId) {
    return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });
  }

  try {
    const targetUrl = `https://obs.itu.edu.tr/public/DersProgram/DersProgramSearch?programSeviyeTipiAnahtari=${level}&dersBransKoduId=${branchId}`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://obs.itu.edu.tr/public/DersProgram',
        'X-Requested-With': 'XMLHttpRequest'
      },
      next: { revalidate: 0 } // Don't cache schedule results to get latest
    });

    if (!response.ok) {
      throw new Error(`ITU API responded with ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const courses: any[] = [];

    // The table rows are directly in the body of the response (which is just a table) or inside tbody
    // Based on the sniffing, the response IS the table.
    // Rows with 'class="table-baslik"' are headers. We want the data rows.
    
    $('tr').each((_, row) => {
      // Skip header rows
      if ($(row).hasClass('table-baslik')) return;
      
      const cols = $(row).find('td');
      if (cols.length < 9) return; // Ensure enough columns

      // Column mapping based on standard ITU OBS table:
      // 0: CRN
      // 1: Code (e.g. BLG 101E)
      // 2: Title
      // 3: Teaching Method
      // 4: Instructor
      // 5: Building
      // 6: Day
      // 7: Time
      // 8: Room

      const crn = $(cols[0]).text().trim();
      const code = $(cols[1]).text().trim();
      const name = $(cols[2]).text().trim();
      const instructor = $(cols[4]).text().trim();
      const capacity = parseInt($(cols[9]).text().trim(), 10) || 0;
      const enrolled = parseInt($(cols[10]).text().trim(), 10) || 0;
      
      // Handle multi-line days/times (e.g. "Monday<br>Thursday")
      // We use a helper to split cell content by <br> or newlines
      const getParts = (colIndex: number) => {
        const cell = $(cols[colIndex]);
        // Replace <br> with a distinct separator before getting text
        cell.find('br').replaceWith('|'); 
        return cell.text().split('|').map(s => s.trim()).filter(s => s);
      };

      const days = getParts(6);
      const times = getParts(7);
      
      // Filter out invalid or header-like rows
      if (!crn || crn === 'CRN') return;

      // Create a course object for each time block
      // Usually days.length should match times.length. 
      // If not, we might fall back to the first one or just data as is (safe fail).
      const count = Math.max(days.length, times.length);
      
      for (let i = 0; i < count; i++) {
         const d = days[i] || days[0]; // Fallback to first if only one day listed for multiple times? rare.
         const t = times[i] || times[0];
         
         if (d && t) {
             courses.push({
               crn, // Same CRN for all blocks
               code,
               name,
               instructor,
               capacity,
               enrolled,
               day: d,
               time: t,
               isEnrolled: false
             });
         }
      }
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json({ error: 'Failed to fetch schedule data' }, { status: 500 });
  }
}
