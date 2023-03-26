/**
 * Converts unix timestamp into a time ago string like 2 hours ago
 * 
 * @param {string} date unix timestamp
 */
export const timeAgo = (unixTimestamp) => {
    const date = new Date(parseInt(unixTimestamp));

    const seconds = Math.round((new Date() - date) / 1000) + 1;
    let interval = Math.round(seconds / 31536000);
  
    if (interval >= 1) {
        return interval + ' năm';
    }
  
    interval = Math.round(seconds / 2592000);
    if (interval >= 1) {
        return interval + ' tháng';
    }
  
    interval = Math.round(seconds / 86400);
    if (interval >= 1) {
        return interval + ' ngày';
    }
  
    interval = Math.round(seconds / 3600);
    if (interval >= 1) {
        return interval + ' giờ';
    }
  
    interval = Math.round(seconds / 60);
    if (interval >= 1) {
        return interval + ' phút';
    }
  
    return Math.round(seconds) + ' giây';
};

/**
 * Convert unix timestamp to current date
 * 
 * @param {string} date unix timestamp
 */
export const currentDate = (unixTimestamp) => {
    const date = new Date(parseInt(unixTimestamp));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Otc', 'Nov', 'Dec'];

    const month = months[date.getMonth() + 1];
    const day = date.getDay();
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    return `${month} ${day}, ${year} ${time}`;
};