// Builds the invoice PDF (A4) with @react-pdf/renderer and the UPI QR with qrcode.
// This module is loaded ONLY when the invoice preview opens (dynamic import), so the PDF/QR
// libraries and fonts never load on the public site or on the first admin page load.
import { Document, Page, View, Text, Image as PdfImage, Svg, Rect, Font, pdf } from "@react-pdf/renderer";
import { create as createQr } from "qrcode";
import { HANGUL, LAYOUT, QR_MM, QR_QUIET, type InvoiceModel, type QrMatrix } from "./model";

/** QR modules for a text, high error correction. */
export function qrMatrix(text: string): QrMatrix {
  const q = createQr(text, { errorCorrectionLevel: "H" });
  const size = q.modules.size, dark: boolean[] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark.push(!!q.modules.get(r, c));
  return { size, dark };
}

const KR_FONT = "/fonts/invoice/NotoSansKR-400-hangul.ttf";
let fontsReady = false;
function registerFonts() {
  if (fontsReady) return;
  const abs = (p: string) => new URL(p, window.location.origin).href;
  Font.register({ family: "QFSans", fonts: [
    { src: abs("/fonts/invoice/NotoSans-400-latin.ttf"), fontWeight: 400 },
    { src: abs("/fonts/invoice/NotoSans-700-latin.ttf"), fontWeight: 700 },
  ] });
  // Only fetched by the PDF engine if some text actually uses it (i.e. contains Hangul)
  Font.register({ family: "QFKorean", fonts: [{ src: abs(KR_FONT), fontWeight: 400 }, { src: abs(KR_FONT), fontWeight: 700 }] });
  Font.registerHyphenationCallback(word => [word]); // never insert hyphens
  fontsReady = true;
}

/** The site logo (WebP) as a JPEG data URL — PDF engines don't read WebP. */
async function logoPng(src: string): Promise<string | null> {
  try {
    const blob = await (await fetch(src)).blob();
    const bmp = await createImageBitmap(blob);
    const c = document.createElement("canvas");
    c.width = bmp.width; c.height = bmp.height;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); // logo has no transparency; JPEG keeps the PDF small
    ctx.drawImage(bmp, 0, 0);
    return c.toDataURL("image/jpeg", 0.92);
  } catch { return null; }
}

const GREEN = "#1f6b3a", LINE = "#6b7280", SOFT = "#e7f3ea";
const fam = (t: string) => (HANGUL.test(t) ? "QFKorean" : "QFSans");
const mm = (n: number) => `${n}mm`;

function Qr({ m }: { m: QrMatrix }) {
  const n = m.size + 2 * QR_QUIET, outer = (QR_MM * n) / m.size;
  const rects: React.ReactElement[] = [];
  for (let r = 0; r < m.size; r++) {
    let c = 0;
    while (c < m.size) {
      if (!m.dark[r * m.size + c]) { c++; continue; }
      let e = c; while (e < m.size && m.dark[r * m.size + e]) e++;
      rects.push(<Rect key={`${r}-${c}`} x={c + QR_QUIET} y={r + QR_QUIET} width={e - c} height={1} fill="#000" />);
      c = e;
    }
  }
  return (
    <Svg viewBox={`0 0 ${n} ${n}`} style={{ width: mm(outer), height: mm(outer) }}>
      <Rect x={0} y={0} width={n} height={n} fill="#fff" />
      {rects}
    </Svg>
  );
}

function InvoiceDocument({ m, logo, qr }: { m: InvoiceModel; logo: string | null; qr: QrMatrix }) {
  const { cfg } = m;
  const L = LAYOUT, cols = L.cols;
  const partW = L.pageW - 2 * L.margin - cols.sr - cols.qty - cols.rate - cols.amount;
  const cell = { paddingTop: mm(0.4), paddingHorizontal: mm(1.3), lineHeight: "10.2pt" }; // 8.5pt × 1.2 = 3.6 mm per line (LAYOUT.rowLine); top padding only: fixed-height rows
  const headCell = { paddingTop: mm(1.1), paddingHorizontal: mm(1.3), lineHeight: "10.2pt" };
  const totalRow = (label: string, value: string, bold = false) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: mm(0.6), ...(bold ? { borderTopWidth: 1, borderTopColor: GREEN, marginTop: mm(0.6), paddingTop: mm(1.2) } : {}) }}>
      <Text style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? 10.5 : 9 }}>{label}</Text>
      <Text style={{ fontWeight: bold ? 700 : 400, fontSize: bold ? 10.5 : 9 }}>{value}</Text>
    </View>
  );
  const tableHead = (
    <View style={{ flexDirection: "row", backgroundColor: SOFT, borderWidth: 1, borderColor: GREEN, height: mm(L.tableHead) }}>
      {[["Sr.", cols.sr, "left"], ["Particulars", partW, "left"], ["Qty", cols.qty, "right"], ["Rate", cols.rate, "right"], ["Amount", cols.amount, "right"]].map(([h, w, a]) => (
        <Text key={h as string} style={{ width: mm(w as number), ...headCell, fontWeight: 700, color: GREEN, textAlign: a as "left" | "right" }}>{h as string}</Text>
      ))}
    </View>
  );
  return (
    <Document title={m.fileName.replace(/\.pdf$/, "")} author={cfg.businessName} subject={`${cfg.title} ${m.orderNumber}`}>
      {m.pages.map((pg, i) => (
        <Page key={i} size="A4" style={{ padding: mm(L.margin), fontFamily: "QFSans", fontSize: 8.5, color: "#111827" }}>
          {pg.first ? (
            <View style={{ height: mm(L.firstHeader) }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", height: mm(21) }}>
                <View style={{ flexDirection: "row", width: mm(140) }}>
                  {logo && <PdfImage src={logo} style={{ width: mm(25), height: mm(19.7), marginRight: mm(3.5) }} />}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>{cfg.businessName}</Text>
                    <Text style={{ fontSize: 8, marginTop: mm(0.6) }}>{cfg.tagline}</Text>
                    <Text style={{ fontSize: 8, marginTop: mm(0.5), color: "#374151" }}>{cfg.address}</Text>
                    <Text style={{ fontSize: 8, marginTop: mm(0.5), color: "#374151" }}>E-mail: {cfg.email}{"   "}Mob.: {cfg.phone}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 14, fontWeight: 700, borderWidth: 1.5, borderColor: GREEN, color: GREEN, paddingVertical: mm(1.2), paddingHorizontal: mm(5), letterSpacing: 1.4 }}>{cfg.title}</Text>
                  <Text style={{ fontSize: 8.5, marginTop: mm(1.5) }}>GST No.: {cfg.gstin}</Text>
                </View>
              </View>
              <View style={{ borderTopWidth: 1.5, borderTopColor: GREEN, marginBottom: mm(2) }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", height: mm(21.5) }}>
                <View style={{ width: mm(120) }}>
                  <Text style={{ fontSize: 7.5, color: LINE, fontWeight: 700 }}>To:</Text>
                  <Text style={{ fontSize: 10, fontWeight: 700, marginTop: mm(0.4), fontFamily: fam(m.customer.name), maxLines: 1, textOverflow: "ellipsis" }}>{m.customer.name}</Text>
                  {m.customer.phone ? <Text style={{ fontSize: 8.5, marginTop: mm(0.4) }}>Phone: {m.customer.phone}</Text> : null}
                  {m.customer.address ? <Text style={{ fontSize: 8, marginTop: mm(0.4), fontFamily: fam(m.customer.address), maxLines: 3, textOverflow: "ellipsis" }}>{m.customer.address}</Text> : null}
                </View>
                <View style={{ width: mm(62) }}>
                  {[["Invoice No.:", m.orderNumber], ["Date:", m.dateText], ["Delivery:", m.delivery]].map(([k, v]) => (
                    <View key={k} style={{ flexDirection: "row", marginBottom: mm(0.8) }}>
                      <Text style={{ width: mm(22), color: LINE, fontWeight: 700, fontSize: 8.5 }}>{k}</Text>
                      <Text style={{ flex: 1, fontSize: 9, fontWeight: k === "Invoice No.:" ? 700 : 400 }}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={{ height: mm(L.contHeader), flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: 700, color: GREEN }}>{cfg.title} {m.orderNumber} (continued)</Text>
              <Text style={{ color: LINE }}>{m.dateText}</Text>
            </View>
          )}

          {pg.rows.length > 0 && tableHead}
          {pg.rows.map(r => (
            <View key={r.sr} style={{ flexDirection: "row", height: mm(L.rowBase + (r.lines - 1) * L.rowLine), borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 0.5, borderColor: "#9ca3af" }}>
              <Text style={{ width: mm(cols.sr), ...cell }}>{r.sr}</Text>
              <Text style={{ width: mm(partW), ...cell, fontFamily: fam(r.name + r.sub), maxLines: r.lines, textOverflow: "ellipsis" }}>
                {r.name}{r.sub ? <Text style={{ fontSize: 7, color: LINE }}>{"  "}{r.sub}</Text> : null}
              </Text>
              <Text style={{ width: mm(cols.qty), ...cell, textAlign: "right" }}>{r.qty}</Text>
              <Text style={{ width: mm(cols.rate), ...cell, textAlign: "right" }}>{r.rate}</Text>
              <Text style={{ width: mm(cols.amount), ...cell, textAlign: "right" }}>{r.amount}</Text>
            </View>
          ))}

          {pg.last && (
            <View style={{ marginTop: mm(1.5), height: mm(L.closing - 1.5) }}>
              <Text style={{ fontSize: 8.5, fontWeight: 700 }}>Items: {m.itemCount}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: mm(0.5) }}>
                <View style={{ width: mm(98), paddingTop: mm(0.6) }}>
                  <Text style={{ fontSize: 8.5 }}><Text style={{ fontWeight: 700 }}>Amount in words: </Text>{m.amountInWords}</Text>
                  <Text style={{ marginTop: mm(1.2), fontSize: 8, color: "#374151" }}>Terms: {cfg.terms}</Text>
                  {m.hasPerKg ? <Text style={{ marginTop: mm(1.2), fontSize: 7.5, color: LINE }}>* Weight-based items are billed by the actual weight at packing.</Text> : null}
                </View>
                <View style={{ width: mm(82) }}>
                  {totalRow("Sub Total", m.subTotal)}
                  {totalRow("Delivery Charges", m.delivery_)}
                  {totalRow("Round off", m.roundOff)}
                  {totalRow("Total Amount", m.totalText, true)}
                </View>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: mm(3) }}>
                <View style={{ width: mm(68), borderWidth: 1, borderColor: "#9ca3af", padding: mm(2) }}>
                  <Text style={{ fontWeight: 700, color: GREEN, marginBottom: mm(1) }}>Bank Details</Text>
                  {[["Account Name", cfg.bank.accountName], ["Bank Name", `${cfg.bank.bankName}, Branch: ${cfg.bank.branch}`], ["Account No.", cfg.bank.accountNo], ["IFSC Code", cfg.bank.ifsc], ["GooglePay / PhonePe", cfg.bank.paymentPhone]].map(([k, v]) => (
                    <Text key={k} style={{ fontSize: 8, marginTop: mm(0.5) }}>{k}: {v}</Text>
                  ))}
                </View>
                <View style={{ width: mm(58), alignItems: "center" }}>
                  <Qr m={qr} />
                  <Text style={{ fontSize: 7.5, textAlign: "center", marginTop: mm(0.5) }}>{m.qrCaption}</Text>
                </View>
                <View style={{ width: mm(52), alignItems: "center" }}>
                  <Text style={{ fontWeight: 700, fontSize: 8.5 }}>{cfg.signatureFor}</Text>
                  <View style={{ height: mm(20) }} />
                  <View style={{ borderTopWidth: 0.8, borderTopColor: "#111827", width: mm(44) }} />
                  <Text style={{ fontSize: 8, marginTop: mm(1) }}>{cfg.signatureLabel}</Text>
                </View>
              </View>
            </View>
          )}

          {/* fixed: sits in the bottom margin without pushing the page to wrap */}
          <Text fixed style={{ position: "absolute", bottom: mm(6), left: 0, right: 0, textAlign: "center", fontSize: 8, color: LINE }}>Page {i + 1} of {m.pages.length}</Text>
        </Page>
      ))}
    </Document>
  );
}

/** Generates the invoice PDF for an already-built model. */
export async function renderInvoicePdf(m: InvoiceModel): Promise<{ blob: Blob; qr: QrMatrix }> {
  registerFonts();
  const qr = qrMatrix(m.upi);
  const logo = await logoPng(m.cfg.logo);
  const blob = await pdf(<InvoiceDocument m={m} logo={logo} qr={qr} />).toBlob();
  return { blob, qr };
}
