import { supabase } from "./supabase"

export async function UploadImageToBucket(file: File) {
    if (!supabase) {
        throw new Error('Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
    }

    const { data, error } = await supabase.storage.from('Image_saved_draft').upload(file.name, file)
    if (error) throw new Error(error.message)
    return data
}

export function GetImageUrlFromBucket(img_path: string): string | null {
    if (!supabase) return null
    const { data } = supabase.storage.from('Image_saved_draft').getPublicUrl(img_path)
    return data?.publicUrl ?? null
}
export async function DeleteImageUrlFromBucket(img_path: string) {
    if (!supabase) return null
    const { data, error } = await supabase.storage.from('Image_saved_draft').remove([img_path])
    if (error) throw new Error(error.message)
    return data ?? null
}

export async function DownloadImageFromBucket(img_path: string) {
    if (!supabase) throw new Error('Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
    const { data, error } = await supabase.storage.from('Image_saved_draft').download(img_path)
    if (error) throw new Error(error.message)

    const filename = img_path.split('/').pop() ?? 'immagine'
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}