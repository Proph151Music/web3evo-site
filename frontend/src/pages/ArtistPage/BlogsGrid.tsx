import moment from 'moment';
import { Blog } from '../../utils/api';
import { Link } from 'wouter';
import Card, {
  CardContent,
  CardInfoRow,
  CardMedia,
  CardSubtitle,
  CardTitle
} from '../../components/ui/Card';

type BlogCardProps = {
  blog: Blog;
};

export default function BlogsGrid({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ">
      {blogs.map((blog, index) => {
        return (
          <Link to={`/artist-page/blogs/${blog.id}`} key={blog.id ?? blog.blogTitle + index}>
            <a href="">
              <BlogCard blog={blog} />
            </a>
          </Link>
        );
      })}
    </div>
  );
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="cursor-pointer min-w-[225px] h-[350px]">
      <CardMedia src={blog.blogBanner ?? ''} className="flex-[2.5]" />
      <CardContent className="flex flex-col">
        <CardTitle>{blog.blogTitle}</CardTitle>
        <CardSubtitle>{blog.blogDescription}</CardSubtitle>
        <div className="flex flex-col-reverse items-baseline justify-between flex-1">
          <CardInfoRow label="Date created">
            {moment(blog.dateCreated).format('MMM DD, YYYY')}
          </CardInfoRow>
        </div>
      </CardContent>
    </Card>
  );
}
