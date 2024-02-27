import { useUser } from '../../context/UserContext';
import Button from '../../components/ui/Button';
import NavLink from '../ui/NavLink';

export default function NavBar() {
  const { user, logoutUser } = useUser();

  return (
    <nav className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full h-full">
      <NavLink to={`/artist-page`}>Artist Page</NavLink>

      <NavLink to="/blog">Blog</NavLink>

      <div className="flex gap-4 md:gap-2 flex-col md:flex-row w-full md:w-auto">
        {!user && (
          <>
            <NavLink to="/create-account">
              <Button
                label="Sign Up"
                iconPath="/assets/icons/User.svg"
                className="min-w-[132px] h-9 md:h-auto"
              />
            </NavLink>

            <NavLink to="/login">
              <Button label="Login" className="min-w-[132px] h-9 md:h-auto" />
            </NavLink>
          </>
        )}

        {user && (
          <Button label="Log out" onClick={logoutUser} className="min-w-[132px] h-9 md:h-auto" />
        )}
      </div>
    </nav>
  );
}
