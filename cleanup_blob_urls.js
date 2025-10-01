// Cleanup script to remove blob URLs from the database
async function cleanupBlobUrls() {
    try {
        // Fetch current drawings
        const response = await fetch('http://localhost:3001/api/drawings');
        const data = await response.json();

        console.log(`Found ${data.drawings.length} drawings`);

        // Clean up drawings
        const cleanedDrawings = data.drawings.map(drawing => {
            const cleaned = { ...drawing };

            // Remove blob URLs from files
            if (cleaned.files && Array.isArray(cleaned.files)) {
                const originalCount = cleaned.files.length;
                cleaned.files = cleaned.files.filter(file => {
                    if (file.url && file.url.startsWith('blob:')) {
                        console.log(`Removing blob URL file: ${file.name} from ${drawing.name}`);
                        return false;
                    }
                    return true;
                });

                if (cleaned.files.length === 0) {
                    delete cleaned.files;
                    console.log(`Removed empty files array from ${drawing.name}`);
                } else if (cleaned.files.length < originalCount) {
                    console.log(`Cleaned files for ${drawing.name}: ${originalCount} -> ${cleaned.files.length}`);
                }
            }

            return cleaned;
        });

        // Save cleaned drawings back
        const saveResponse = await fetch('http://localhost:3001/api/drawings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ drawings: cleanedDrawings }),
        });

        if (saveResponse.ok) {
            console.log('Successfully cleaned up blob URLs from database');
        } else {
            console.error('Failed to save cleaned drawings:', saveResponse.statusText);
        }

    } catch (error) {
        console.error('Error cleaning up blob URLs:', error);
    }
}

cleanupBlobUrls();
