const bcrypt = require('bcrypt');
async function test() {
  const hash = '$2b$10$bDWLe26kIePt79FMfa2K0OwESW9ppYFkaWgINZ9PqbbpOLrN1nopC';
  const match = await bcrypt.compare('password123', hash);
  console.log('Matches:', match);
}
test();
