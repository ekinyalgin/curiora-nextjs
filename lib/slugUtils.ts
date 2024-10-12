export async function checkSlugUniqueness(slug: string, type: string, id?: number): Promise<boolean> {
      const url = `/api/check-slug?slug=${encodeURIComponent(slug)}&type=${type}${id ? `&id=${id}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
            throw new Error('Failed to check slug uniqueness');
      }
      const data = await response.json();
      return data.isUnique;
}

export async function generateUniqueSlug(baseSlug: string, type: string, id?: number): Promise<string> {
      let slug = baseSlug;
      let counter = 1;
      let isUnique = await checkSlugUniqueness(slug, type, id);

      while (!isUnique) {
            slug = `${baseSlug}-${counter}`;
            isUnique = await checkSlugUniqueness(slug, type, id);
            counter++;
      }

      return slug;
}
