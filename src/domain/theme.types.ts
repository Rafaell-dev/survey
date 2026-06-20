export type ThemeLayout = 'CARD' | 'FULL_PAGE' | 'COMPACT';

export interface SurveyTheme {
  id: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  fontFamily: string;
  headerImage?: string | null;
  layout: ThemeLayout;
  surveyId: string;
}

export interface UpdateThemeDTO {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  fontFamily?: string;
  headerImage?: string | null;
  layout?: ThemeLayout;
}
