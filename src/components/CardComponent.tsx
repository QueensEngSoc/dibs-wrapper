import { Card, CardActions, CardContent, CardMedia, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { GridProps } from '@material-ui/core/Grid';
import { ReactElement } from 'react';

export enum CardSizes {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  XL = 'xl',
  XXL = 'xxl'
}

const CardWidth = {
  small: { xs: 6, sm: 5, md: 3, lg: 3, xl: 2 },
  medium: { xs: 10, sm: 7, md: 5, lg: 4, xl: 3 },
  large: { xs: 12, sm: 9, md: 6, lg: 4, xl: 3 },
  xl: { xs: 12, sm: 10, md: 8, lg: 6, xl: 5 },
  xxl: { xs: 12, sm: 10, md: 9, lg: 8, xl: 7 }
};

export default function CardComponent({ gridWidth, cardImg, cardImageTitle, cardHeaderText, cardDescription, cardActions, baseClass }: {
  gridWidth?: CardSizes | GridProps,
  baseClass: string,
  cardImg: string,
  cardImageTitle: string,
  cardHeaderText: string,
  cardDescription: string | ReactElement<any>,
  cardActions?: Array<ReactElement<any>>
}) {

  let itemWidth: GridProps;

  if (gridWidth) {
    if (gridWidth instanceof Object)
      itemWidth = gridWidth as GridProps;
    else
      itemWidth = (CardWidth[gridWidth as CardSizes] as GridProps) || { xs: 12, sm: 9, md: 6, lg: 4, xl: 3 };
  }

  const card = (
    <div className={baseClass}>
      <Card className={`${baseClass}__main-card`}>
        <CardMedia
          className={`${baseClass}__main-card__img`}
          image={cardImg}
          title={cardImageTitle || 'ILC'}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {cardHeaderText}
          </Typography>
          {cardDescription}
          {cardActions && <CardActions>
            {cardActions.map((action) => {
              return (action);
            })
            }
          </CardActions>
          }
        </CardContent>
      </Card>
    </div>
  );

  if (gridWidth)
    return (
      <Grid item {...itemWidth}>
        {card}
      </Grid>
    );

  return card;
}
