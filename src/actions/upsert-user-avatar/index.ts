'use server'

import { put } from '@vercel/blob'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import { usersTable } from '@/db/schema'

export async function uploadUserAvatar(formData: FormData, userId: string) {
    const file = formData.get('photo') as File

    if (!file || file.size === 0) {
        throw new Error('Imagem inválida')
    }

    // Verifica se o token está disponível
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN não configurado')
    }

    const blob = await put(file.name, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    await db.update(usersTable)
        .set({ avatarImageURL: blob.url })
        .where(eq(usersTable.id, userId))

    return { url: blob.url }
}
