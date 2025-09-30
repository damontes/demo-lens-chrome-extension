export const LineIncreaseIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );
};

export const LineDecreaseIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
      <polyline points="16 17 22 17 22 11"></polyline>
    </svg>
  );
};

export const RandomIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"></path>
      <path d="m18 2 4 4-4 4"></path>
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"></path>
      <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"></path>
      <path d="m18 14 4 4-4 4"></path>
    </svg>
  );
};

export const PulseGraphIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
    </svg>
  );
};

export const FlatLineIcon = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14"></path>
    </svg>
  );
};

export const CircleImpactIcon = (props: any) => {
  const { impact, ...otherProps } = props;

  // Define the configurations for each impact level
  const impactConfigs = {
    HIGH: {
      backdropColor: '#038153',
      fillColor: '#038153',
      fillPath:
        'M10 0.750977C8.02219 0.750977 6.08879 1.33747 4.4443 2.43628C2.79981 3.53509 1.51808 5.09688 0.761205 6.92414C0.00432836 8.7514 -0.193705 10.7621 0.192147 12.7019C0.577999 14.6417 1.53041 16.4235 2.92893 17.822C4.32746 19.2206 6.10929 20.173 8.0491 20.5588C9.98891 20.9447 11.9996 20.7466 13.8268 19.9898C15.6541 19.2329 17.2159 17.9512 18.3147 16.3067C19.4135 14.6622 20 12.7288 20 10.751H17C17 12.1354 16.5895 13.4888 15.8203 14.64C15.0511 15.7911 13.9579 16.6883 12.6788 17.2181C11.3997 17.7479 9.99224 17.8866 8.63437 17.6165C7.2765 17.3464 6.02922 16.6797 5.05025 15.7007C4.07128 14.7218 3.4046 13.4745 3.1345 12.1166C2.86441 10.7587 3.00303 9.35128 3.53284 8.07219C4.06266 6.79311 4.95986 5.69986 6.11101 4.93069C7.26215 4.16152 8.61553 3.75098 10 3.75098V0.750977Z',
      centerY: '10.751',
      startY: '0.750977',
    },
    MEDIUM: {
      backdropColor: '#FFEEDB',
      fillColor: '#ED8F1C',
      fillPath:
        'M10 0.729004C7.34784 0.729004 4.8043 1.78257 2.92893 3.65794C1.05357 5.5333 2.3186e-07 8.07684 0 10.729C-2.3186e-07 13.3812 1.05357 15.9247 2.92893 17.8001C4.80429 19.6754 7.34783 20.729 10 20.729L10 17.729C8.14348 17.729 6.36301 16.9915 5.05025 15.6788C3.7375 14.366 3 12.5855 3 10.729C3 8.87249 3.7375 7.09201 5.05025 5.77926C6.36301 4.4665 8.14349 3.729 10 3.729V0.729004Z',
      centerY: '10.729',
      startY: '0.729004',
    },
    LOW: {
      backdropColor: '#CEE2F2',
      fillColor: '#1F73B7',
      fillPath:
        'M10 0.729004C8.58165 0.729004 7.17953 1.03072 5.88672 1.61413C4.59391 2.19754 3.44 3.04928 2.50159 4.11282C1.56319 5.17635 0.861758 6.42735 0.443875 7.78274C0.0259919 9.13813 -0.0987841 10.5669 0.0778313 11.9742L3.05448 11.6007C2.93085 10.6155 3.01819 9.61539 3.31071 8.66662C3.60323 7.71784 4.09423 6.84215 4.75112 6.09767C5.408 5.3532 6.21574 4.75698 7.1207 4.34859C8.02567 3.94021 9.00716 3.729 10 3.729V0.729004Z',
      centerY: '10.729',
      startY: '0.729004',
    },
  };

  const config = impactConfigs[impact as keyof typeof impactConfigs] || impactConfigs.MEDIUM;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" fill="none" {...otherProps}>
      <path
        d={`M20 ${config.centerY}C20 16.2519 15.5228 20.729 10 20.729C4.47715 20.729 0 16.2519 0 ${config.centerY}C0 5.20616 4.47715 ${config.startY} 10 ${config.startY}C15.5228 ${config.startY} 20 5.20616 20 ${config.centerY}ZM3 ${config.centerY}C3 14.595 6.13401 17.729 10 17.729C13.866 17.729 17 14.595 17 ${config.centerY}C17 6.86301 13.866 3.729 10 3.729C6.13401 3.729 3 6.86301 3 ${config.centerY}Z`}
        fill={config.backdropColor}
      />
      <path d={config.fillPath} fill={config.fillColor} />
    </svg>
  );
};
