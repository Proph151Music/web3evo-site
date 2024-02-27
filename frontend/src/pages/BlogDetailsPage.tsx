import useUserProfile from '../hooks/use-user-profile';
import moment from 'moment';
import { useLocation, useParams } from 'wouter';
import { useUser } from '../context/UserContext';

export default function BlogDetailsPage() {
  const [location, setLocation] = useLocation();
  const { user, loadingUser } = useUser();
  const username = user?.username ?? '';

  const { blogId = '' } = useParams();
  const { userProfile, loading: loadingProfile } = useUserProfile({ username });

  /*************************************
   *            Render Logic           *
   *************************************/

  if (loadingUser || loadingProfile) {
    return <>Loading...</>;
  }

  // missing username means user is not signed-in
  if (!user && location !== '/login') {
    setLocation('/login');
    return null;
  }

  if (!userProfile) {
    return <>User not found.</>;
  }

  const { blogs } = userProfile;
  const blog = blogs.find((blog) => blog.id === blogId);
  if (!blog) {
    return <>Blog not found.</>;
  }
  const { authorId, dateCreated, blogBanner, blogDescription, blogTitle, id } = blog;
  return (
    <div className="flex items-center justify-center self-center w-full max-w-5xl">
      <div className="flex flex-col bg-neutral-800 rounded-3xl overflow-hidden pb-8 mx:pb-24 w-full">
        <div
          style={{
            backgroundImage: `url('${blogBanner}')`, // Replace with your image path
            backgroundSize: 'cover', // This makes sure the image covers the whole element
            backgroundPosition: 'center', // This centers the image in the element
            backgroundRepeat: 'no-repeat', // Prevents the image from tiling
            height: 350, // Example height, adjust as needed
            width: '100%' // Example width, adjust as needed
          }}
        ></div>
        <div className="flex flex-col gap-4 py-8 px-8 md:px-24">
          <div>
            <h3 className="text-5xl">
              {blogTitle}{' '}
              {false && (
                <span className="font-normal text-xs mono-space-font text-neutral-400">
                  by {authorId}
                </span>
              )}
            </h3>
            <p className="font-space-mono">{blogDescription}</p>
          </div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <div className="text-xs text-neutral-400">Created</div>
              <div className="font-space-mono text-sm">{moment(dateCreated).format('LL')}</div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-xs text-neutral-400">ID</div>
              <div className="font-space-mono text-sm">{id}</div>
            </div>
          </div>
        </div>
        <div className="px-8 md:px-24"></div>
      </div>
    </div>
  );
}
