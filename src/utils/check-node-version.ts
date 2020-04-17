const nodeVersion = 10;

const currentNodeVersion = process.versions.node;
const [major] = currentNodeVersion.split('.');

if (Number(major) < nodeVersion) {
  console.error(`You are running Node ${currentNodeVersion}.
Create NiceNode App requires Node ${nodeVersion} or higher.
Please update your version of Node.
`);
  process.exit(1);
}
