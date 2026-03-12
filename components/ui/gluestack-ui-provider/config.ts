import { vars } from 'nativewind';

export const colors = {
  light: {
    '--primary': '199 159 39',            // #C79F27 — brand gold
    '--primary-foreground': '255 255 255', // white on gold
    '--background': '255 255 255',         // #FFFFFF
    '--card': '245 245 245',              // #F5F5F5
    '--card-foreground': '33 30 31',
    '--popover': '255 255 255',
    '--popover-foreground': '33 30 31',
    '--secondary': '245 245 245',
    '--secondary-foreground': '33 30 31',
    '--muted': '245 245 245',
    '--muted-foreground': '110 106 107',   // #6E6A6B
    '--accent': '248 244 238',
    '--accent-foreground': '33 30 31',
    '--destructive': '220 38 38',
    '--foreground': '33 30 31',            // #211E1F
    '--border': '229 225 220',
    '--input': '229 225 220',
    '--ring': '199 159 39',
  },
  dark: {
    '--primary': '212 175 55',             // #D4AF37 — luminous gold
    '--primary-foreground': '18 18 18',    // near-black on gold
    '--background': '18 18 18',            // #121212
    '--card': '30 30 30',                  // #1E1E1E
    '--card-foreground': '255 255 255',
    '--popover': '30 30 30',
    '--popover-foreground': '255 255 255',
    '--secondary': '38 38 38',
    '--secondary-foreground': '255 255 255',
    '--muted': '38 38 38',
    '--muted-foreground': '175 175 175',   // #AFAFAF
    '--accent': '38 38 38',
    '--accent-foreground': '255 255 255',
    '--destructive': '255 100 103',
    '--foreground': '255 255 255',         // #FFFFFF
    '--border': '46 46 46',
    '--input': '46 46 46',
    '--ring': '212 175 55',
  },
};

export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
