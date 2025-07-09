import { NOTIFICATION_TYPES } from '@/actions/dictionary';
import InfoIcon from '@zendeskgarden/svg-icons/src/16/info-stroke.svg';
import ErrorIcon from '@zendeskgarden/svg-icons/src/16/alert-error-stroke.svg';
import WarningIcon from '@zendeskgarden/svg-icons/src/16/alert-warning-stroke.svg';
import SuccessIcon from '@zendeskgarden/svg-icons/src/16/check-circle-stroke.svg';

const NOTIFICATION_DICTONARY = {
  [NOTIFICATION_TYPES.error]: {
    rawIcon: ErrorIcon,
    color: 'rgb(205, 54, 66)',
  },
  [NOTIFICATION_TYPES.info]: {
    rawIcon: InfoIcon,
    color: 'rgb(41, 50, 57)',
  },
  [NOTIFICATION_TYPES.warning]: {
    rawIcon: WarningIcon,
    color: 'rgb(172, 89, 24)',
  },
  [NOTIFICATION_TYPES.success]: {
    rawIcon: SuccessIcon,
    color: 'rgb(3, 127, 82)',
  },
};

export function showGlobalNotification(title: string, message: string, type: string) {
  const existingNotification = document.getElementById('global-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.id = 'global-notification';

  const { rawIcon, color } = NOTIFICATION_DICTONARY[type];
  const parsedIcon = decodeURIComponent(rawIcon);

  const notificationElement = `
  <div style="position: relative; border: 1px solid rgb(216, 220, 222);  border-radius: 4px;padding: 20px 40px; line-height: 1.42857; font-size: 14px; box-shadow: rgba(10, 13, 14, 0.16) 0px 20px 28px 0px; background-color: rgb(255, 255, 255); color: rgb(41, 50, 57);" role="alert">
    ${parsedIcon.split(',').at(-1)}
    <h2 style="font-weight: bold; color: ${color};">${title}</h2>
    <span>${message}</span>
  </div>
  `;

  notification.innerHTML = notificationElement;
  const iconElement = notification.querySelector('svg');

  if (iconElement) {
    Object.assign(iconElement.style, {
      position: 'absolute',
      left: '16px',
      color,
    });
  }

  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '9999999999',
    transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
    opacity: '0',
    transform: 'translateX(100%)',
    maxWidth: '320px',
  });

  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 500);
    }
  }, 5000);
}
