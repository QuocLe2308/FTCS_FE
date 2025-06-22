// material-ui
// import logoIconDark from 'assets/images/logo-icon-dark.svg';
// import logoIcon from 'assets/images/logo-icon.svg';
import logoIcon from 'assets/images/logo.png';
/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoIconDark from 'assets/images/logo-icon-dark.svg';
 * import logoIcon from 'assets/images/logo-icon.svg';
 * import { ThemeMode } from 'config';
 *
 */

// ==============================|| LOGO ICON SVG ||============================== //

const LogoIcon = () => {
  return (
    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={theme.palette.mode === ThemeMode.DARK ? logoIconDark : logoIcon} alt="Mantis" width="100" />
     *
     */
    <img src={logoIcon} alt="FTCS" width="50" />
    //
  );
};

export default LogoIcon;
