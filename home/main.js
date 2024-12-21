// 为论文预览图添加hover效果
document.querySelectorAll('.publication-preview').forEach(preview => {
    preview.addEventListener('mouseenter', () => {
        preview.style.transform = 'scale(1.02)';
        preview.style.transition = 'transform 0.2s';
    });
    
    preview.addEventListener('mouseleave', () => {
        preview.style.transform = 'scale(1)';
    });
});

// 添加滚动动画效果
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 为所有卡片添加观察器
document.querySelectorAll('.publication-item, .interest-card, .contact-item').forEach(
    el => observer.observe(el)
);

// 修改打字机效果
const bioText = document.querySelector('.bio-text');
if (bioText) {
    const paragraphs = bioText.querySelectorAll('p');
    let currentParagraph = 0;
    let currentChar = 0;
    
    function typeWriter() {
        if (currentParagraph < paragraphs.length) {
            const text = paragraphs[currentParagraph].getAttribute('data-text') || paragraphs[currentParagraph].innerText;
            paragraphs[currentParagraph].setAttribute('data-text', text);
            
            if (currentChar < text.length) {
                paragraphs[currentParagraph].innerText = text.substring(0, currentChar + 1);
                currentChar++;
                setTimeout(typeWriter, 20);
            } else {
                currentParagraph++;
                currentChar = 0;
                setTimeout(typeWriter, 100);
            }
        }
    }
    
    // 清空初始文本
    paragraphs.forEach(p => {
        p.setAttribute('data-text', p.innerText);
        p.innerText = '';
    });
    
    // 当元素进入视图时开始打字效果
    const bioObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            typeWriter();
            bioObserver.unobserve(bioText);
        }
    });
    
    bioObserver.observe(bioText);
}

// 可以添加更多交互功能 

// 图片懒加载优化
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // 浏览器支持原生懒加载
        console.log('Browser supports native lazy loading');
    } else {
        // 回退方案：使用 Intersection Observer
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});

// 修改图片加载错误处理
document.querySelectorAll('.publication-preview').forEach(img => {
    img.addEventListener('error', function() {
        if (!this.hasAttribute('data-error-handled')) {
            this.setAttribute('data-error-handled', 'true');
            this.style.display = 'none'; // 隐藏而不是替换
            // 可选：添加一个小提示
            const notice = document.createElement('small');
            notice.style.color = '#666';
            notice.textContent = 'Preview loading...';
            this.parentNode.insertBefore(notice, this);
        }
    });
});