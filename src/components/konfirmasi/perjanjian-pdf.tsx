import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { formatRupiah } from "@/lib/utils";
import { kodeTransaksi } from "@/lib/kode";
import { hargaAntarJemputTransaksi } from "@/lib/harga-antar-jemput";
import { labelLayananAntarJemput } from "@/types/antar-jemput";
import {
  PERJANJIAN_STANDAR,
  ADENDUM_BARANG_BERNILAI_TINGGI,
} from "@/lib/templates/perjanjian";
import type { TransaksiDetail } from "@/types/transaksi";

const BRAND_PURPLE = "#6C3FC4";

const styles = StyleSheet.create({
  page: { padding: 32, paddingBottom: 48, fontSize: 10, color: "#1A1A2E" },
  header: {
    backgroundColor: BRAND_PURPLE,
    padding: 16,
    marginBottom: 16,
    borderRadius: 6,
  },
  headerText: { color: "#FFFFFF", fontSize: 16, fontWeight: 700 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8 },
  paragraph: { marginBottom: 6, lineHeight: 1.5 },
  table: { marginTop: 4, marginBottom: 12 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
  },
  label: { color: "#555555" },
  value: { fontWeight: 700 },
  signatureBox: { marginTop: 24, alignItems: "center" },
  signatureImage: { width: 200, height: 80, objectFit: "contain" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
});

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>TitipKuy! — Pernyataan Kesediaan Penitipan Barang</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Footer({ tanggalDibuat }: { tanggalDibuat: string }) {
  return (
    <Text style={styles.footer}>
      Dokumen ini dibuat secara digital pada {tanggalDibuat}
    </Text>
  );
}

function formatTanggal(dateStr: string) {
  return format(new Date(dateStr), "d MMMM yyyy", { locale: localeId });
}

interface PerjanjianPdfDocumentProps {
  transaksi: TransaksiDetail;
}

export function PerjanjianPdfDocument({ transaksi }: PerjanjianPdfDocumentProps) {
  const { pelanggan, paket, antarJemputOption } = transaksi;
  const hargaAntarJemputDipilih = hargaAntarJemputTransaksi(transaksi);
  const totalAkhir = transaksi.hargaPaketTertagih + hargaAntarJemputDipilih;
  const kode = kodeTransaksi(transaksi.nomorUrut);
  const tanggalDibuat = formatTanggal(transaksi.createdAt);
  const layananLabel =
    transaksi.layananJemput && transaksi.layananAntar
      ? "jemput-dan-antar"
      : transaksi.layananAntar
        ? "antar-saja"
        : "jemput-saja";

  return (
    <Document title={`Pernyataan Kesediaan ${kode}`}>
      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.sectionTitle}>Kode Transaksi: {kode}</Text>

        <View style={styles.table}>
          <Row label="Nama" value={pelanggan.nama} />
          <Row label="No WhatsApp" value={pelanggan.whatsapp} />
          <Row label="Alamat Kos" value={pelanggan.alamatKos} />
          <Row label="Kampus" value={pelanggan.kampus ?? "-"} />
          <Row label="Paket" value={paket.nama} />
          <Row label="Harga Paket" value={formatRupiah(transaksi.hargaPaketTertagih)} />
          <Row
            label="Antar-Jemput"
            value={
              antarJemputOption
                ? `${antarJemputOption.label} — ${labelLayananAntarJemput(layananLabel)} (+${formatRupiah(hargaAntarJemputDipilih)})`
                : "Mandiri (Grab/Lalamove)"
            }
          />
          <Row label="TOTAL" value={formatRupiah(totalAkhir)} />
          <Row label="Tanggal Masuk" value={formatTanggal(transaksi.tanggalMasuk)} />
          <Row
            label="Tanggal Jatuh Tempo"
            value={formatTanggal(transaksi.tanggalJatuhTempo)}
          />
          {transaksi.nilaiDeklarasi != null && (
            <Row label="Nilai Deklarasi" value={formatRupiah(transaksi.nilaiDeklarasi)} />
          )}
        </View>

        {PERJANJIAN_STANDAR.split("\n\n").map((paragraf, i) => (
          <Text key={i} style={styles.paragraph}>
            {paragraf}
          </Text>
        ))}

        <Footer tanggalDibuat={tanggalDibuat} />
      </Page>

      {paket.perluDeklarasi && (
        <Page size="A4" style={styles.page}>
          <Header />
          <Text style={styles.sectionTitle}>Adendum — Barang Bernilai Tinggi</Text>

          <View style={styles.table}>
            <Row
              label="Nilai Deklarasi"
              value={formatRupiah(transaksi.nilaiDeklarasi ?? 0)}
            />
            <Row label="Deskripsi Barang" value={transaksi.deskripsiDeklarasi ?? "-"} />
          </View>

          {ADENDUM_BARANG_BERNILAI_TINGGI.split("\n\n").map((paragraf, i) => (
            <Text key={i} style={styles.paragraph}>
              {paragraf}
            </Text>
          ))}

          <Footer tanggalDibuat={tanggalDibuat} />
        </Page>
      )}

      <Page size="A4" style={styles.page}>
        <Header />
        <Text style={styles.sectionTitle}>Halaman Kesediaan & Tanda Tangan</Text>
        <Text style={styles.paragraph}>
          Dengan menandatangani secara digital di bawah ini, saya, {pelanggan.nama},
          menyatakan telah membaca, memahami, dan menyetujui seluruh isi pernyataan
          kesediaan penitipan barang TitipKuy! ini, termasuk adendum (jika berlaku).
        </Text>

        <View style={styles.signatureBox}>
          {/* Image di sini dari @react-pdf/renderer (elemen PDF, bukan <img>
              HTML); tipenya tidak punya prop alt sama sekali. */}
          {transaksi.tandaTanganUrl && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={transaksi.tandaTanganUrl} style={styles.signatureImage} />
          )}
          <Text style={{ marginTop: 8 }}>{pelanggan.nama}</Text>
          <Text style={{ color: "#777777" }}>
            Disetujui pada {formatTanggal(transaksi.createdAt)}
          </Text>
        </View>

        <Footer tanggalDibuat={tanggalDibuat} />
      </Page>
    </Document>
  );
}
