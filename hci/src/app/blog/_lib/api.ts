import dotenv from 'dotenv';
import { createClient, Entry, EntrySkeletonType, Asset } from 'contentful';
dotenv.config();

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
});

type PagingInfo = {
  _start?: number;
  _limit?: number;
};

type Image = {
  fields: {
    file: {
      url: string;
      fileName: string;
      contentType: string;
    };
  };
};

export type Post = {
  id: string;
  title: string;
  brief: string;
  story: string;
  date: string;
  image: Image | null;
  writer: string;
};

type PostFields = EntrySkeletonType & {
  title: string;
  brief: string;
  story: string;
  date: string;
  image: Asset | null;
  writer: string;
};

export type PostEntry = Entry<PostFields>;

export async function getPostsCount(): Promise<number> {
  const entries = await client.getEntries({
    content_type: 'post',
    limit: 1,
  });
  return entries.total;
}

export async function getPosts({
  _start = 0,
  _limit = 10,
}: PagingInfo): Promise<Post[]> {
  const entries = await client.getEntries<PostFields>({
    content_type: 'post',
    skip: _start,
    limit: _limit,
    order: ['-fields.date'],
  });

  return entries.items.map((item) => {
    const image = item.fields.image && typeof item.fields.image === 'object' && 'fields' in item.fields.image ? { fields: { file: (item.fields.image as Asset).fields.file as { url: string; fileName: string; contentType: string; } } } : null;
    return {
      id: item.sys.id,
      title: item.fields.title as string,
      brief: item.fields.brief as string,
      story: item.fields.story as string,
      date: item.fields.date as string,
      image: image,
      writer: item.fields.writer as string,
    };
  });
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const entry = await client.getEntry<PostFields>(id);
    const image = entry.fields.image && typeof entry.fields.image === 'object' && 'fields' in entry.fields.image ? { fields: { file: (entry.fields.image as Asset).fields.file as { url: string; fileName: string; contentType: string; } } } : null;

    return {
      id: entry.sys.id,
      title: entry.fields.title as string,
      brief: entry.fields.brief as string,
      story: entry.fields.story as string,
      date: entry.fields.date as string,
      image: image,
      writer: entry.fields.writer as string,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
