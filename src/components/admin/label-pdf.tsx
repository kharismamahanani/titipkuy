import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { HUB_CONFIG } from "@/lib/constants";
import type { BarangLabel, TransaksiDetail } from "@/types/transaksi";

const MAX_DESKRIPSI = 30;

function namaDepan(nama: string) {
  return nama.trim().split(/\s+/)[0] ?? nama;
}

function potongDeskripsi(deskripsi: string) {
  return deskripsi.length > MAX_DESKRIPSI
    ? `${deskripsi.slice(0, MAX_DESKRIPSI)}…`
    : deskripsi;
}

function namaHub(hub: string | null) {
  if (hub && hub in HUB_CONFIG) return HUB_CONFIG[hub as keyof typeof HUB_CONFIG].nama;
  return HUB_CONFIG.suhat.nama;
}

const mmToPt = (mm: number) => mm * 2.834645669;

const thermalStyles = StyleSheet.create({
  page: {
    padding: mmToPt(2),
    fontSize: 10,
    color: "#000000",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
    paddingBottom: 4,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  qrWrap: { alignItems: "center", marginVertical: 8 },
  qr: { width: mmToPt(40), height: mmToPt(40) },
  kode: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000000",
    letterSpacing: 1,
  },
  info: { fontSize: 9, paddingTop: 6, paddingHorizontal: 3 },
  infoRow: { marginBottom: 2 },
  footer: {
    fontSize: 7,
    textAlign: "center",
    paddingTop: 4,
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
  },
});

interface LabelPdfProps {
  items: BarangLabel[];
  transaksi: TransaksiDetail;
  verifyUrl: string;
  qrDataUrls: Record<string, string>;
  paperSize: { width: number; height: number };
}

// Dokumen PDF label thermal — ukuran halaman mengikuti `paperSize` (mm) yang
// dipilih admin, supaya cocok dengan setting printer fisik mereka sendiri.
export function ThermalLabelPdf({ items, transaksi, verifyUrl, qrDataUrls, paperSize }: LabelPdfProps) {
  return (
    <Document>
      {items.map((barang) => (
        <Page
          key={barang.id}
          size={{ width: mmToPt(paperSize.width), height: mmToPt(paperSize.height) }}
          style={thermalStyles.page}
        >
          <Text style={thermalStyles.header}>TitipKuy! · {namaHub(transaksi.hub)}</Text>

          <View style={thermalStyles.qrWrap}>
            <Image style={thermalStyles.qr} src={qrDataUrls[barang.id]} />
          </View>

          <Text style={thermalStyles.kode}>{barang.kodeLabel}</Text>

          <View style={thermalStyles.info}>
            <Text style={thermalStyles.infoRow}>Nama : {namaDepan(transaksi.pelanggan.nama)}</Text>
            <Text style={thermalStyles.infoRow}>Paket : {transaksi.paket.nama}</Text>
            <Text style={thermalStyles.infoRow}>
              Masuk : {format(new Date(transaksi.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
            </Text>
            <Text style={thermalStyles.infoRow}>
              Tempo : {format(new Date(transaksi.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
            </Text>
            <Text style={thermalStyles.infoRow}>Barang: {potongDeskripsi(barang.deskripsi)}</Text>
          </View>

          <Text style={thermalStyles.footer}>
            titipkuy.online · {new Date(transaksi.createdAt).getFullYear()}
          </Text>
        </Page>
      ))}
    </Document>
  );
}

const a4Styles = StyleSheet.create({
  page: { padding: 24, fontSize: 10, color: "#000000" },
  label: {
    width: mmToPt(100),
    height: mmToPt(60),
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#999999",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  brand: { fontSize: 9, fontWeight: 700 },
  kode: { fontSize: 14, fontWeight: 700, textAlign: "center", letterSpacing: 1 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  infoCol: { fontSize: 8, flex: 1, paddingRight: 8 },
  infoRow: { marginBottom: 1 },
  qr: { width: 42, height: 42 },
});

// Dokumen PDF label A4 — beberapa label per halaman, ukuran kertas tetap A4
// standar (tidak bergantung pada printer thermal).
export function PrintableLabelPdf({ items, transaksi, verifyUrl, qrDataUrls }: LabelPdfProps) {
  return (
    <Document>
      <Page size="A4" style={a4Styles.page}>
        {items.map((barang) => (
          <View key={barang.id} style={a4Styles.label}>
            <Text style={a4Styles.brand}>TitipKuy!</Text>
            <Text style={a4Styles.kode}>{barang.kodeLabel}</Text>
            <View style={a4Styles.bottomRow}>
              <View style={a4Styles.infoCol}>
                <Text style={a4Styles.infoRow}>{transaksi.pelanggan.nama}</Text>
                <Text style={a4Styles.infoRow}>{transaksi.paket.nama}</Text>
                <Text style={a4Styles.infoRow}>
                  Masuk: {format(new Date(transaksi.tanggalMasuk), "d MMM yyyy", { locale: localeId })}
                </Text>
                <Text style={a4Styles.infoRow}>
                  Tempo: {format(new Date(transaksi.tanggalJatuhTempo), "d MMM yyyy", { locale: localeId })}
                </Text>
                <Text style={a4Styles.infoRow}>{barang.deskripsi}</Text>
              </View>
              <Image style={a4Styles.qr} src={qrDataUrls[barang.id]} />
            </View>
          </View>
        ))}
      </Page>
    </Document>
  );
}
