export interface Project {
  name: string;
  description: string;
  url?: string;
  tech?: string[];
}

// Hand-written list of personal projects shown on the personal page.
// The section is hidden while this is empty. Example entry:
//   {
//     name: 'my-project',
//     description: 'One or two sentences on what it does.',
//     url: 'https://github.com/charlesw25/my-project',
//     tech: ['Python', 'Redis'],
//   },
export const projects: Project[] = [];
