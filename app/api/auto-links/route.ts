import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { keyword, url, languageId } = await req.json();

    // Keyword'ü küçük harfe çevir
    const lowercaseKeyword = keyword.toLowerCase();

    const autoLink = await prisma.autoLink.create({
      data: { 
        keyword: lowercaseKeyword, 
        url, 
        languageId: parseInt(languageId) 
      },
    });

    // Mevcut içerikleri kontrol et ve linkle
    await updateExistingContent(autoLink);

    return NextResponse.json(autoLink);
  } catch (error) {
    console.error('Error creating auto link:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const autoLinks = await prisma.autoLink.findMany({
      include: { 
        language: true
      },
    });
    return NextResponse.json(autoLinks);
  } catch (error) {
    console.error('Error fetching auto links:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

async function updateExistingContent(autoLink: any) {
  const posts = await prisma.post.findMany({
    where: { languageId: autoLink.languageId },
  });

  for (const post of posts) {
    // Büyük/küçük harf duyarsız arama için içeriği küçük harfe çevir
    const lowercaseContent = post.content.toLowerCase();
    if (lowercaseContent.includes(autoLink.keyword)) {
      // Yalnızca ilk eşleşmeyi değiştir, orijinal büyük/küçük harf yapısını koru
      const updatedContent = post.content.replace(
        new RegExp(`\\b${escapeRegExp(autoLink.keyword)}\\b(?![^<]*>|[^<>]*<\/)`, 'i'),
        (match) => `[${match}](${autoLink.url})`
      );
      
      if (updatedContent !== post.content) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            content: updatedContent,
            autoLinks: { connect: { id: autoLink.id } },
          },
        });
      }
    }
  }
}

// Özel karakterleri escape etmek için yardımcı fonksiyon
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
