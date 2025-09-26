import React from 'react';

interface AfkarLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  inline?: boolean; // Use inline SVG for better styling control
}

/**
 * Afkar Logo Component
 * 
 * @param variant - 'full' for logo with text, 'icon' for symbol only
 * @param size - Predefined sizes or use className for custom sizing
 * @param className - Additional CSS classes
 * @param inline - Use inline SVG instead of img tag for better styling
 */
export const AfkarLogo: React.FC<AfkarLogoProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'full',
  inline = false
}) => {
  const sizeClasses = {
    sm: variant === 'full' ? 'h-6 w-auto' : 'h-4 w-4',
    md: variant === 'full' ? 'h-8 w-auto' : 'h-6 w-6', 
    lg: variant === 'full' ? 'h-12 w-auto' : 'h-8 w-8',
    xl: variant === 'full' ? 'h-16 w-auto' : 'h-12 w-12'
  };

  // For inline SVG, we can provide better styling control
  if (inline && variant === 'icon') {
    return (
      <svg 
        viewBox="0 0 42 52" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} ${className}`}
      >
        <path d="M6.62403 28.5261V36.2888C6.62277 36.8819 6.82167 37.4579 7.18853 37.9239C7.5554 38.3898 8.06876 38.7183 8.64553 38.8561L23.8001 42.979L30.2659 51.6507C30.3732 51.7947 30.5231 51.9012 30.6944 51.955C30.8657 52.0089 31.0496 52.0073 31.2199 51.9507C31.3903 51.8941 31.5385 51.7851 31.6434 51.6395C31.7483 51.4938 31.8046 51.3187 31.8044 51.1392V44.5004L37.9526 45.668C38.3387 45.7578 38.7401 45.7594 39.1269 45.6726C39.5136 45.5858 39.8759 45.4128 40.1866 45.1666C40.4973 44.9205 40.7485 44.6074 40.9214 44.2507C41.0943 43.8939 41.1846 43.5028 41.1854 43.1064V10.1633C41.1846 9.76691 41.0943 9.37579 40.9214 9.01909C40.7485 8.66238 40.4973 8.34928 40.1866 8.10309C39.8759 7.85691 39.5136 7.68397 39.1269 7.59717C38.7401 7.51037 38.3387 7.51193 37.9526 7.60174L30.5359 9.32277V30.9565C30.5372 31.3092 30.4582 31.6576 30.305 31.9753C30.1518 32.293 29.9283 32.5717 29.6514 32.7902C29.3746 33.0088 29.0517 33.1616 28.7071 33.2369C28.3625 33.3123 28.0053 33.3083 27.6625 33.2252L22.2084 32.1945V38.0897C22.2053 38.2473 22.1534 38.4 22.0597 38.5268C21.9661 38.6535 21.8354 38.7481 21.6857 38.7974C21.536 38.8466 21.3747 38.8482 21.2241 38.8018C21.0735 38.7555 20.941 38.6635 20.8449 38.5385L15.1208 30.8576L6.62403 28.5261Z" fill="url(#paint0_linear_1655_10328)"/>
        <path d="M6.62402 16.9746V28.5255L15.1227 30.8475L20.8468 38.5284C20.9429 38.6533 21.0754 38.7453 21.226 38.7917C21.3766 38.8381 21.5379 38.8365 21.6876 38.7872C21.8373 38.738 21.968 38.6434 22.0616 38.5167C22.1553 38.3899 22.2072 38.2372 22.2103 38.0796V32.1844L27.6625 33.2246C28.0048 33.3063 28.3611 33.3093 28.7047 33.2333C29.0484 33.1573 29.3702 33.0044 29.6462 32.7859C29.9221 32.5675 30.1448 32.2893 30.2976 31.9723C30.4504 31.6553 30.5293 31.3078 30.5283 30.9559V9.31836L8.64553 14.413C8.06971 14.5506 7.55706 14.8783 7.1903 15.343C6.82353 15.8078 6.62404 16.3826 6.62402 16.9746Z" fill="url(#paint1_linear_1655_10328)"/>
        <path d="M-0.102533 8.36722V24.912C-0.103683 25.4391 0.0731324 25.9513 0.399284 26.3654C0.725435 26.7796 1.18183 27.0715 1.69457 27.194L6.62376 28.5252V16.9743C6.62378 16.3823 6.82327 15.8075 7.19004 15.3427C7.5568 14.878 8.06945 14.5504 8.64527 14.4127L30.53 9.31807V2.33124C30.5299 1.97949 30.4503 1.6323 30.2971 1.31569C30.1438 0.999074 29.9209 0.721242 29.645 0.503001C29.3692 0.284761 29.0475 0.131769 28.7041 0.0554857C28.3607 -0.0207974 28.0045 -0.0183945 27.6622 0.0625145L1.69457 6.1042C1.18386 6.22376 0.7285 6.51231 0.402312 6.92306C0.0761234 7.33382 -0.101771 7.84271 -0.102533 8.36722Z" fill="url(#paint2_linear_1655_10328)"/>
        <defs>
          <linearGradient id="paint0_linear_1655_10328" x1="34.4173" y1="52.0539" x2="19.47" y2="11.0628" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00A6FF"/>
            <stop offset="1" stopColor="#80DDFF"/>
          </linearGradient>
          <linearGradient id="paint1_linear_1655_10328" x1="34.6246" y1="33.2512" x2="9.31491" y2="10.661" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1244FF"/>
            <stop offset="1" stopColor="#8AA7FF"/>
          </linearGradient>
          <linearGradient id="paint2_linear_1655_10328" x1="26.3025" y1="31.9559" x2="9.31655" y2="3.87353" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6A55FF"/>
            <stop offset="0.01" stopColor="#6C57FF"/>
            <stop offset="0.32" stopColor="#917FFF"/>
            <stop offset="0.59" stopColor="#AD9CFF"/>
            <stop offset="0.83" stopColor="#BDAEFF"/>
            <stop offset="1" stopColor="#C3B4FF"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Use external file for full logo or when inline is false
  const logoSrc = variant === 'full' ? '/afkar-logo.svg' : '/afkar-icon.svg';
  
  return (
    <img 
      src={logoSrc} 
      alt="Afkar" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default AfkarLogo;
