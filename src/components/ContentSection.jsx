const ContentSection = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6 bg-white " 
         style={{ boxShadow: '-8px 0 15px -5px rgba(0, 0, 0, 0.1)' }}>
      {/* Main Title */}
      <h1 className="text-[2.8rem] font-bold leading-[1.1] mb-3" 
          style={{ 
            fontFamily: 'Arial, sans-serif',
            color: '#D63426',
            letterSpacing: '-0.02em'
          }}>
        Hành Trình Toàn Diện<br />
        Khám Phá Tư Tưởng Hồ Chí Minh
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
               fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
               color: '#333'
             }}>
            <span className="font-bold">Hồ Chí Minh</span> (tên khai sinh Nguyễn Sinh Cung, sau đổi tên Nguyễn Tất Thành và Nguyễn Ái Quốc trong thời kỳ cách mạng) sinh ngày 19 tháng 5 năm 1890 tại làng Kim Liên, huyện Nam Đàn, tỉnh Nghệ An, và qua đời ngày 2 tháng 9 năm 1969 tại Hà Nội.
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
               fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
               color: '#666'
             }}>
            © Bộ Văn hóa, Thể thao và Du lịch Việt Nam. Nguồn: Cục Lưu trữ Quốc gia Việt Nam.
          </p>
        </div>

        {/* Article Text */}
        <div className="flex-1">
          <div className="text-[0.875rem] leading-[1.6] space-y-3" 
               style={{ 
                 fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
                 color: '#333'
               }}>
            <p style={{ textAlign: 'justify' }}>
              <span className="float-left text-[4.5rem] font-bold leading-[0.85] mr-[0.15rem] mt-[0.1rem]" 
                    style={{ fontFamily: 'Arial, sans-serif' }}>C</span>
              hủ tịch Hồ Chí Minh là một người yêu nước chân chính, một nhà cách mạng sáng suốt và một lãnh tụ thiên tài. Cuộc đời và sự nghiệp cách mạng của Người gắn bó mật thiết với lịch sử vẻ vang của dân tộc Việt Nam. Người đã cống hiến trọn đời cho sự nghiệp giải phóng dân tộc của nhân dân Việt Nam, đóng góp vào cuộc đấu tranh chung của các dân tộc vì hòa bình, độc lập, dân chủ và tiến bộ xã hội.
            </p>
            
            <p style={{ textAlign: 'justify' }}>
              Năm 1987, UNESCO đã vinh danh Hồ Chí Minh là "Anh hùng giải phóng dân tộc, Danh nhân văn hóa kiệt xuất của Việt Nam". Tư tưởng của Người kết hợp chủ nghĩa yêu nước với chủ nghĩa quốc tế, hòa quyện những giá trị truyền thống Việt Nam với tư tưởng cách mạng hiện đại. Qua những bài viết và hành động của mình, Người đã truyền cảm hứng cho nhiều thế hệ người Việt Nam đấu tranh vì tự do và phẩm giá của Tổ quốc.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentSection;
