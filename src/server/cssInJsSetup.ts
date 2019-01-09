import { install } from '@material-ui/styles';

export function setUpMuiStyles() {
  try {
    install();
  } catch (err) {
    console.error('Failed to set up styles because of ', err);
  }
}
