import PDFDocument from 'pdfkit'

const DARK  = '#1a1a2e'
const GREY  = '#555555'
const LGREY = '#f7f7f7'
const BORD  = '#d0d0d0'

export type Doc = InstanceType<typeof PDFDocument>

export function buildPdf(drawFn: (doc: Doc) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', c => chunks.push(c))
    doc.on('end',  () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    drawFn(doc)
    doc.end()
  })
}

export function header(doc: Doc, title: string, subtitle: string) {
  doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK).text('WLTH', 50, 50)
  doc.moveTo(50, 76).lineTo(545, 76).strokeColor(DARK).lineWidth(1).stroke()
  doc.font('Helvetica-Bold').fontSize(15).fillColor(DARK).text(title, 50, 84)
  doc.font('Helvetica-Oblique').fontSize(9).fillColor(GREY).text(subtitle, 50, 104)
  doc.y = 122
}

export function sectionTitle(doc: Doc, text: string) {
  doc.moveDown(0.5)
  doc.font('Helvetica-Bold').fontSize(11).fillColor(DARK).text(text)
  doc.moveDown(0.3)
}

export function bodyText(doc: Doc, text: string) {
  doc.font('Helvetica').fontSize(8.5).fillColor('#000000').text(text, { align: 'justify' })
  doc.moveDown(0.4)
}

export function labelValue(doc: Doc, label: string, value: string) {
  const x = doc.x
  doc.font('Helvetica').fontSize(8).fillColor(GREY).text(label, x, doc.y, { continued: false })
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(value ?? '—')
  doc.moveTo(x, doc.y).lineTo(x + 495, doc.y).strokeColor(BORD).lineWidth(0.3).stroke()
  doc.moveDown(0.5)
}

export function borrowersTable(doc: Doc, borrowers: Array<{ surname: string; given_names: string }>) {
  sectionTitle(doc, 'Borrower(s)')
  const startY = doc.y
  const colW = [60, 120, 140]
  const headers = ['', 'Surname', 'Given Name(s)']
  const rowH = 18

  // Header row
  doc.rect(50, startY, 320, rowH).fill(LGREY)
  headers.forEach((h, i) => {
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(DARK)
      .text(h, 50 + colW.slice(0, i).reduce((a, b) => a + b, 0), startY + 4, { width: colW[i] })
  })

  // Data rows
  borrowers.forEach((b, idx) => {
    const rowY = startY + rowH * (idx + 1)
    const cells = [`Borrower ${idx + 1}`, b.surname, b.given_names]
    cells.forEach((cell, i) => {
      doc.font('Helvetica').fontSize(8.5).fillColor('#000000')
        .text(cell, 50 + colW.slice(0, i).reduce((a, b) => a + b, 0), rowY + 4, { width: colW[i] })
    })
    doc.rect(50, rowY, 320, rowH).strokeColor(BORD).lineWidth(0.3).stroke()
  })

  doc.rect(50, startY, 320, rowH * (borrowers.length + 1)).strokeColor(BORD).lineWidth(0.3).stroke()
  doc.y = startY + rowH * (borrowers.length + 1) + 10
}

export function signature(doc: Doc, borrower: { given_names: string; surname: string }, auth: { signature_base64: string; signed_date: string; home_contact?: string; work_contact?: string }, idx: number) {
  sectionTitle(doc, `Customer Authorisation – ${borrower.given_names} ${borrower.surname}`)
  doc.font('Helvetica').fontSize(8).fillColor(GREY).text('Signature')
  try {
    const raw = auth.signature_base64.includes(',')
      ? auth.signature_base64.split(',')[1]
      : auth.signature_base64
    const buf = Buffer.from(raw, 'base64')
    doc.image(buf, doc.x, doc.y, { width: 160, height: 52 })
    doc.y += 58
  } catch {
    doc.font('Helvetica').fontSize(8).fillColor(GREY).text('[Signature not available]')
  }

  // Contact + date row
  const rowY = doc.y
  if (auth.home_contact !== undefined) {
    doc.font('Helvetica').fontSize(8).fillColor(GREY).text('Home Contact', 50, rowY)
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(auth.home_contact || '—', 50, rowY + 10)
    doc.font('Helvetica').fontSize(8).fillColor(GREY).text('Work Contact', 210, rowY)
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(auth.work_contact || '—', 210, rowY + 10)
    doc.font('Helvetica').fontSize(8).fillColor(GREY).text('Date', 370, rowY)
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(auth.signed_date, 370, rowY + 10)
    doc.y = rowY + 28
  } else {
    doc.font('Helvetica').fontSize(8).fillColor(GREY).text('Date', 50, rowY)
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(auth.signed_date, 50, rowY + 10)
    doc.y = rowY + 28
  }

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BORD).lineWidth(0.3).stroke()
  doc.moveDown(0.8)
}

export function pageFooter(doc: Doc, formName: string) {
  const range = doc.bufferedPageRange()
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i)
    doc.font('Helvetica').fontSize(7).fillColor(GREY)
      .text(
        `WLTH-V1.1  |  ${formName}  |  Australian Credit Licence 525752`,
        50, 810, { align: 'center', width: 495 }
      )
  }
}
