import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      const folders = await readdir(uploadsDir, { withFileTypes: true });
      const yearMonthFolders = folders
            .filter((dirent) => dirent.isDirectory())
            .flatMap((yearDir) => {
                  const yearPath = join(uploadsDir, yearDir.name);
                  return readdir(yearPath, { withFileTypes: true }).then((monthDirs) =>
                        monthDirs
                              .filter((dirent) => dirent.isDirectory())
                              .map((monthDir) => `${yearDir.name}/${monthDir.name}`)
                  );
            });

      const folderNames = await Promise.all(yearMonthFolders);
      return NextResponse.json(folderNames.flat());
}
