import ImageUploadButton from '@/components/ImageUploadButton'
import { GetImageUrlFromBucket } from '@/lib/bucket'
import { useState } from 'react'

type ImageUploaderViewProps = {
    img_path?: string | null
    imageToUpload: (file: File) => void
}
export default function ImageUploaderView({ img_path, imageToUpload }: ImageUploaderViewProps) {
    const [pendingImage, setPendingImage] = useState<File | null>(null)
    return (
        <div className="flex flex-col gap-2">
            {(pendingImage || img_path) && (
                <img
                    src={
                        pendingImage
                            ? URL.createObjectURL(pendingImage)
                            : (GetImageUrlFromBucket(img_path!) ?? undefined)
                    }
                    alt="Anteprima immagine"
                    className="w-[120px] h-auto rounded-none border"
                />
            )}
            <ImageUploadButton
                onFileSelect={(file) => {
                    setPendingImage(file)
                    imageToUpload(file)
                }}
                label={img_path || pendingImage ? 'Cambia immagine' : 'Carica immagine'}
            />
        </div>
    )
}
