const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkAndReplace(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walkAndReplace(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace 'http://localhost:8080 with import.meta.env.VITE_API_URL + '
            const regex = /(['"`])http:\/\/localhost:8080/g;
            if (regex.test(content)) {
                content = content.replace(regex, 'import.meta.env.VITE_API_URL + $1');
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        }
    });
}

walkAndReplace(directoryPath);
console.log('Done replacing URLs!');
