import { Blog, NftCollection } from '../../utils/api';
import NftCollectionsGrid from './NftCollectionsGrid';
import BlogsGrid from './BlogsGrid';
import { Link, useParams } from 'wouter';

type ProfileContentProps = {
  blogs: Blog[];
  collections: NftCollection[];
};

export default function ProfileContent({ blogs, collections }: ProfileContentProps) {
  const { contentType = '' } = useParams();

  const getStyle = (tabName: string) =>
    contentType === tabName ? 'cursor-default selected-tab' : 'hover:text-white cursor-pointer';

  return (
    <div>
      <div className="border-t border-gray-400">
        <div className="flex flex-row justify-around mx-auto max-w-7xl">
          <Link to="/artist-page/collections" className={`tab ${getStyle('collections')}`}>
            Collections
          </Link>
          <Link to="/artist-page/blogs" className={`tab ${getStyle('blogs')}`}>
            Blogs
          </Link>
        </div>
      </div>
      <div className="bg-neutral-700 p-8">
        <div className="flex flex-col md:flex-row gap-8 mx-auto w-full max-w-7xl page-gutter">
          {contentType === 'collections' && <NftCollectionsGrid collections={collections} />}
          {contentType === 'blogs' && <BlogsGrid blogs={blogs} />}
        </div>
      </div>
    </div>
  );
}
