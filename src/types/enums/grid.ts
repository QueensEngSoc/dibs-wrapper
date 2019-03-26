import { GridProps } from '@material-ui/core/Grid';

export const GridItemWidths: {
  small: GridProps,
  medium: GridProps,
  large: GridProps,
  xl: GridProps,
  xxl: GridProps
} = {
  small: { xs: 6, sm: 5, md: 3, lg: 3, xl: 2 },
  medium: { xs: 10, sm: 7, md: 5, lg: 4, xl: 3 },
  large: { xs: 12, sm: 9, md: 6, lg: 4, xl: 3 },
  xl: { xs: 12, sm: 10, md: 8, lg: 6, xl: 5 },
  xxl: { xs: 12, sm: 10, md: 9, lg: 8, xl: 7 }
};
