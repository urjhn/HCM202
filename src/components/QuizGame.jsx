import Swal from 'sweetalert2';
import './QuizGame.css';
import { trackEvent } from '../utils/tracking';

// Tạo âm thanh vỗ tay
const playApplause = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZURE');
  audio.volume = 0.3;
  audio.play().catch(() => { });
};

const playCorrectSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

const playWrongSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Tạo âm thanh buzzer thấp cho câu sai
  oscillator.frequency.value = 200;
  oscillator.type = 'sawtooth';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

// Câu hỏi về "Quá trình hình thành tư tưởng Hồ Chí Minh"
const quizData = [
  {
    question: "Hồ Chí Minh sinh năm nào?",
    options: ["1889", "1890", "1891", "1892"],
    correct: 1,
    explanation: "Chủ tịch Hồ Chí Minh sinh ngày 19/5/1890 tại xã Kim Liên, Nam Đàn, Nghệ An."
  },
  {
    question: "Tên khai sinh của Hồ Chí Minh là gì?",
    options: ["Nguyễn Tất Thành", "Nguyễn Sinh Cung", "Nguyễn Ái Quốc", "Nguyễn Văn Thành"],
    correct: 1,
    explanation: "Tên khai sinh của Người là Nguyễn Sinh Cung. Sau đó Người lấy tên là Nguyễn Tất Thành."
  },
  {
    question: "Năm nào Nguyễn Tất Thành ra đi tìm đường cứu nước?",
    options: ["1909", "1910", "1911", "1912"],
    correct: 2,
    explanation: "Năm 1911, Nguyễn Tất Thành (sau này là Hồ Chí Minh) ra đi tìm đường cứu nước từ bến cảng Nhà Rồng, Sài Gòn."
  },
  {
    question: "Đảng Cộng sản Việt Nam được thành lập vào năm nào?",
    options: ["1928", "1929", "1930", "1931"],
    correct: 2,
    explanation: "Ngày 3/2/1930, Nguyễn Ái Quốc chủ trì Hội nghị hợp nhất các tổ chức cộng sản ở Hương Cảng (Trung Quốc), thành lập Đảng Cộng sản Việt Nam."
  },
  {
    question: "Tác phẩm nào được Hồ Chí Minh viết trong nhà tù Trung Quốc?",
    options: ["Đường Kách mệnh", "Nhật ký trong tù", "Lời kêu gọi độc lập", "Tuyên ngôn độc lập"],
    correct: 1,
    explanation: "Trong thời gian bị giam cầm ở Trung Quốc (1942-1943), Hồ Chí Minh viết tập thơ 'Nhật ký trong tù' bằng chữ Hán."
  },
  {
    question: "Tư tưởng Hồ Chí Minh được hình thành dựa trên nền tảng nào?",
    options: [
      "Chỉ có chủ nghĩa Mác - Lênin",
      "Chủ nghĩa Mác - Lênin kết hợp với truyền thống dân tộc",
      "Chỉ có truyền thống văn hóa Việt Nam",
      "Tư tưởng phương Tây"
    ],
    correct: 1,
    explanation: "Tư tưởng Hồ Chí Minh là sự vận dụng và phát triển sáng tạo chủ nghĩa Mác - Lênin vào điều kiện cụ thể của Việt Nam, kết hợp với truyền thống văn hóa dân tộc."
  },
  {
    question: "Tác phẩm 'Bản án chế độ thực dân Pháp' được Nguyễn Ái Quốc xuất bản vào năm nào?",
    options: ["1923", "1924", "1925", "1926"],
    correct: 2,
    explanation: "'Bản án chế độ thực dân Pháp' (Le Procès de la colonisation française) được xuất bản năm 1925, tố cáo tội ác của chủ nghĩa thực dân."
  },
  {
    question: "Hội Việt Nam Cách mạng Thanh niên được thành lập năm nào?",
    options: ["1923", "1924", "1925", "1926"],
    correct: 2,
    explanation: "Tháng 6/1925, Nguyễn Ái Quốc thành lập Hội Việt Nam Cách mạng Thanh niên tại Quảng Châu, Trung Quốc."
  },
  {
    question: "Tác phẩm 'Đường Kách mệnh' của Hồ Chí Minh viết về nội dung gì?",
    options: [
      "Lịch sử Việt Nam",
      "Con đường giải phóng dân tộc",
      "Văn hóa truyền thống",
      "Kinh tế xã hội"
    ],
    correct: 1,
    explanation: "'Đường Kách mệnh' (1927) là tác phẩm nêu rõ con đường cách mạng giải phóng dân tộc của Việt Nam theo định hướng chủ nghĩa Mác - Lênin."
  },
  {
    question: "Yếu tố nào là cốt lõi trong tư tưởng Hồ Chí Minh?",
    options: [
      "Độc lập dân tộc",
      "Chủ nghĩa xã hội",
      "Độc lập dân tộc gắn liền với chủ nghĩa xã hội",
      "Dân chủ tự do"
    ],
    correct: 2,
    explanation: "Cốt lõi tư tưởng Hồ Chí Minh là độc lập dân tộc gắn liền với chủ nghĩa xã hội - đây là con đường duy nhất để giải phóng dân tộc và đưa đất nước phát triển."
  }
];

class QuizGame {
  constructor() {
    this.currentQuestion = 0;
    this.score = 0;
    this.userAnswers = [];
    this.startTime = null;
  }

  async start() {
    this.currentQuestion = 0;
    this.score = 0;
    this.userAnswers = [];
    this.startTime = Date.now();

    await this.showWelcome();

    // Tracking start
    trackEvent('quiz_start');

    await this.playQuiz();
  }

  async showWelcome() {
    const result = await Swal.fire({
      title: '<strong>🎯 QUIZ TƯ TƯỞNG HỒ CHÍ MINH</strong>',
      html: `
        <div class="quiz-welcome">
          <div class="quiz-star">⭐</div>
          <h3>Quá trình hình thành Tư tưởng Hồ Chí Minh</h3>
          <p>Trả lời ${quizData.length} câu hỏi để kiểm tra kiến thức của bạn!</p>
          <div class="quiz-info">
            <div class="info-item">
              <span class="info-icon">📝</span>
              <span>${quizData.length} câu hỏi</span>
            </div>
            <div class="info-item">
              <span class="info-icon">🏆</span>
              <span>Điểm tối đa: ${quizData.length * 10}</span>
            </div>
          </div>
        </div>
      `,
      icon: null,
      showCancelButton: true,
      confirmButtonText: 'Bắt đầu! 🚀',
      cancelButtonText: 'Để sau',
      customClass: {
        popup: 'quiz-popup quiz-welcome-popup',
        confirmButton: 'quiz-btn-confirm',
        cancelButton: 'quiz-btn-cancel'
      },
      background: '#ffebee',
      color: '#1a1a1a',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });

    if (!result.isConfirmed) {
      throw new Error('Cancelled');
    }
  }

  async playQuiz() {
    for (let i = 0; i < quizData.length; i++) {
      this.currentQuestion = i;
      const question = quizData[i];

      const result = await this.askQuestion(question, i);

      if (result.isDismissed) {
        const shouldContinue = await this.confirmExit();
        if (!shouldContinue) {
          return;
        }
        i--; // Repeat current question
        continue;
      }

      this.userAnswers.push(result.value);

      if (parseInt(result.value) === question.correct) {
        this.score += 10;
        await this.showCorrectAnswer(question);
      } else {
        await this.showWrongAnswer(question);
      }
    }

    await this.showResults();
  }

  async askQuestion(question, index) {
    const optionsHtml = question.options.map((option, i) => `
      <div class="quiz-option">
        <input type="radio" id="option${i}" name="answer" value="${i}" required>
        <label for="option${i}">
          <span class="option-letter">${String.fromCharCode(65 + i)}</span>
          <span class="option-text">${option}</span>
        </label>
      </div>
    `).join('');

    return await Swal.fire({
      title: `<strong>Câu ${index + 1}/${quizData.length}</strong>`,
      html: `
        <div class="quiz-question-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${((index) / quizData.length) * 100}%"></div>
          </div>
          <div class="score-display">🏆 Điểm: ${this.score}</div>
          <h3 class="question-text">${question.question}</h3>
          <form id="quizForm" class="quiz-options">
            ${optionsHtml}
          </form>
        </div>
      `,
      icon: null,
      showCancelButton: true,
      confirmButtonText: 'Trả lời ✓',
      cancelButtonText: '← Thoát',
      customClass: {
        popup: 'quiz-popup quiz-question-popup',
        confirmButton: 'quiz-btn-confirm',
        cancelButton: 'quiz-btn-cancel'
      },
      background: '#ffebee',
      color: '#1a1a1a',
      showClass: {
        popup: 'animate__animated animate__bounceIn'
      },
      preConfirm: () => {
        const form = document.getElementById('quizForm');
        const selected = form.querySelector('input[name="answer"]:checked');
        if (!selected) {
          Swal.showValidationMessage('Vui lòng chọn một đáp án!');
          return false;
        }
        return selected.value;
      }
    });
  }

  async showCorrectAnswer(question) {
    // Phát âm thanh vỗ tay và âm thanh đúng
    playApplause();
    setTimeout(() => playCorrectSound(), 100);

    await Swal.fire({
      title: '<strong>🎉 Chính xác!</strong>',
      html: `
        <div class="result-container correct">
          <div class="result-icon">✓</div>
          <p class="result-text">${question.explanation}</p>
          <div class="score-earned">+10 điểm (Tổng: ${this.score})</div>
        </div>
      `,
      icon: null,
      confirmButtonText: 'Tiếp tục →',
      customClass: {
        popup: 'quiz-popup result-popup correct-popup',
        confirmButton: 'quiz-btn-confirm'
      },
      background: '#ffebee',
      color: '#1a1a1a',
      timer: 5000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__zoomIn'
      }
    });
  }

  async showWrongAnswer(question) {
    // Phát âm thanh buzzer khi trả lời sai
    playWrongSound();

    await Swal.fire({
      title: '<strong>😔 Chưa đúng!</strong>',
      html: `
        <div class="result-container wrong">
          <div class="result-icon">✗</div>
          <p class="result-text">
            <strong>Đáp án đúng:</strong> ${question.options[question.correct]}
          </p>
          <p class="explanation">${question.explanation}</p>
        </div>
      `,
      icon: null,
      confirmButtonText: 'Tiếp tục →',
      customClass: {
        popup: 'quiz-popup result-popup wrong-popup',
        confirmButton: 'quiz-btn-confirm'
      },
      background: '#ffebee',
      color: '#1a1a1a',
      timer: 5000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__shakeX'
      }
    });
  }

  async confirmExit() {
    const result = await Swal.fire({
      title: 'Thoát quiz?',
      text: 'Bạn có chắc muốn thoát? Kết quả hiện tại sẽ không được lưu.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Thoát',
      cancelButtonText: 'Tiếp tục chơi',
      customClass: {
        popup: 'quiz-popup'
      }
    });

    return !result.isConfirmed;
  }

  async showResults() {
    const percentage = (this.score / (quizData.length * 10)) * 100;
    const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);

    let grade, emoji, message;
    if (percentage >= 90) {
      grade = 'Xuất sắc';
      emoji = '🏆';
      message = 'Bạn đã nắm vững kiến thức về tư tưởng Hồ Chí Minh!';
    } else if (percentage >= 70) {
      grade = 'Khá';
      emoji = '🌟';
      message = 'Kiến thức khá tốt, tiếp tục phát huy!';
    } else if (percentage >= 50) {
      grade = 'Trung bình';
      emoji = '📚';
      message = 'Cần ôn tập thêm để hiểu rõ hơn!';
    } else {
      grade = 'Cần cố gắng';
      emoji = '💪';
      message = 'Hãy học thêm về tư tưởng Hồ Chí Minh nhé!';
    }

    await Swal.fire({
      title: `<strong>${emoji} ${grade}!</strong>`,
      html: `
        <div class="quiz-results">
          <div class="result-score-big">${this.score}/${quizData.length * 10}</div>
          <div class="result-percentage">${percentage.toFixed(0)}%</div>
          <p class="result-message">${message}</p>
          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">Thời gian:</span>
              <span class="stat-value">${timeTaken}s</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Đúng:</span>
              <span class="stat-value">${this.score / 10}/${quizData.length}</span>
            </div>
          </div>
          <div class="result-actions">
            <button onclick="window.quizGame.start()" class="result-btn retry">🔄 Chơi lại</button>
          </div>
        </div>
      `,
      icon: null,
      confirmButtonText: 'Đóng',
      customClass: {
        popup: 'quiz-popup result-final-popup',
        confirmButton: 'quiz-btn-confirm'
      },
      background: '#ffebee',
      color: '#1a1a1a',
      showClass: {
        popup: 'animate__animated animate__jackInTheBox'
      },
      allowOutsideClick: false
    });
  }
}

export default QuizGame;
