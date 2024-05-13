const { execSync } = require('child_process');

try {
  console.log('Running migrations...');
  execSync('sequelize db:migrate', { stdio: 'inherit' });
  console.log('Migrations completed successfully.');
} catch (error) {
  console.error('Error running migrations:', error);
}
