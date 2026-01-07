const ContentSection = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6 bg-white " 
         style={{ boxShadow: '-8px 0 15px -5px rgba(0, 0, 0, 0.1)' }}>
      {/* Main Title */}
      <h1 className="text-[2.8rem] font-bold leading-[1.1] mb-3" 
          style={{ 
            fontFamily: 'Franklin Gothic Medium, Arial, sans-serif',
            color: '#D63426',
            letterSpacing: '-0.02em'
          }}>
        A Comprehensive Journey<br />
        through Ho Chi Minh's Ideology
      </h1>

      {/* Content Container with Image and Text */}
      <div className="flex gap-4 mt-4 mb-6 items-start">
        {/* Image Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden">
            {/* Placeholder for avatar image */}
            <img 
              src="https://cdnimage.daihoidang.vn/t380x475/Media/Graphic/Profile/2020/11/21/chu-tich-ho-chi-minh.JPG" 
              alt="Ho Chi Minh"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 pt-1" style={{ maxWidth: '600px' }}>
          <p className="text-[0.95rem] leading-[1.4]" 
             style={{ 
               fontFamily: 'Georgia, serif',
               color: '#333'
             }}>
            <span className="font-bold">Ho Chi Minh</span> (birth name Nguyen Sinh Cung, later known as Nguyen Tat Thanh and Nguyen Ai Quoc during his revolutionary years) was born on May 19, 1890 in Kim Lien village, Nam Dan district, Nghe An province, and passed away on September 2, 1969 in Hanoi.
          </p>
        </div>
      </div>

      {/* Main Image and Article Content */}
      <div className="flex gap-6 mt-6">
        {/* Large Image */}
        <div className="flex-shrink-0" style={{ width: '65%', marginLeft: '-200px', position: 'relative' }}>
          <img 
            src="https://bvhttdl.mediacdn.vn/2020/10/27/5-15875454604011998230042-16036836450041268704454-1603763865239-1603763866080171610522.jpg" 
            alt="Ho Chi Minh historical moment"
            className="w-full h-auto"
          />
          <p className="text-[0.7rem] mt-2 leading-[1.3] italic" 
             style={{ 
               fontFamily: 'Georgia, serif',
               color: '#666'
             }}>
            © Ministry of Culture, Sports and Tourism of Vietnam. Source: Vietnam National Archives.
          </p>
        </div>

        {/* Article Text */}
        <div className="flex-1">
          <div className="text-[0.875rem] leading-[1.6] space-y-3" 
               style={{ 
                 fontFamily: 'Georgia, serif',
                 color: '#333'
               }}>
            <p style={{ textAlign: 'justify' }}>
              <span className="float-left text-[4.5rem] font-bold leading-[0.85] mr-[0.15rem] mt-[0.1rem]" 
                    style={{ fontFamily: 'Georgia, serif' }}>P</span>
              resident Ho Chi Minh was a true patriot, an enlightened revolutionary, and a genius leader. His life and revolutionary career are closely linked to the glorious history of the Vietnamese nation. He devoted his entire life to the cause of national liberation of the Vietnamese people, contributing to the common struggle of nations for peace, independence, democracy and social progress.
            </p>
            
            <p style={{ textAlign: 'justify' }}>
              In 1987, UNESCO honored Ho Chi Minh as "National Liberation Hero, Outstanding Cultural Figure of Vietnam". His ideology combined patriotism with internationalism, blending traditional Vietnamese values with modern revolutionary thought. Through his writings and actions, he inspired generations of Vietnamese people to fight for their country's freedom and dignity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
