import { auth } from "@/lib/auth";
import { checkUpload, MAX_UPLOAD_BYTES, sniffType, type UploadKind } from "@/lib/admin/files";
import { storeFile } from "@/lib/admin/storage";

const KINDS: UploadKind[] = ["image", "cv"];

/** Receives one file from the admin, validates it and returns its public URL. */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non autorisé." }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }

  const kind = form.get("kind") as UploadKind;
  const file = form.get("file");
  if (!KINDS.includes(kind) || !(file instanceof File)) {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  // Cheap check before reading the whole file into memory.
  if (file.size > MAX_UPLOAD_BYTES[kind]) {
    return Response.json({ error: checkUpload(kind, file.size, null) }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffType(bytes);
  const error = checkUpload(kind, bytes.length, type);
  if (error || !type) return Response.json({ error }, { status: 415 });

  try {
    const url = await storeFile(kind, bytes, type);
    return Response.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: "L'envoi a échoué. Réessaie." }, { status: 500 });
  }
}
