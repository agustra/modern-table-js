# 🧪 HTML Tests - API Parameter Transformation

Manual testing files untuk **API Parameter Transformation Guide**.

## 📁 Test Files

### 1. `test-dummyjson.html`
- **Basic DummyJSON integration**
- Server-side paging dengan parameter transformation
- Console logging untuk debugging
- **URL**: `http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-dummyjson.html`

### 2. `test-advanced-features.html`
- **Advanced features** dengan sorting dan search
- Data preprocessing (fullName, ageGroup, status)
- Avatar rendering dengan custom render function
- Detailed console logging
- **URL**: `http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-advanced-features.html`

### 3. `test-error-handling.html`
- **Error handling** dengan 2 tabel side-by-side
- Valid API (DummyJSON) vs Invalid API (404)
- Try-catch dalam beforeRequest dan dataSrc
- Graceful fallback untuk error cases
- **URL**: `http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-error-handling.html`

### 4. `test-minimal.html`
- **Minimal implementation** (paling sederhana)
- Hanya essential code untuk DummyJSON
- Menampilkan code snippet di halaman
- **URL**: `http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-minimal.html`

### 5. `test-search-functionality.html`
- **Search functionality testing** dengan dual endpoints
- Visual indicators untuk endpoint type
- Real-time URL display dan response stats
- Test cases untuk berbagai search scenarios
- **URL**: `http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-search-functionality.html`

## 🚀 Cara Menjalankan

1. **Start HTTP Server**:
   ```bash
   npx http-server
   ```

2. **Buka di Browser**:
   - http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-dummyjson.html
   - http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-advanced-features.html
   - http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-error-handling.html
   - http://127.0.0.1:8080/html-tests/api-parameter-transformation/test-minimal.html

## 🎯 Testing Checklist

### Basic Functionality
- [ ] ✅ Page 1 loads correctly (users 1-10)
- [ ] ✅ Page 2 shows users 11-20
- [ ] ✅ Search functionality works
- [ ] ✅ Pagination shows 21 pages (208 total users)

### Advanced Features
- [ ] ✅ Sorting by column works
- [ ] ✅ Data preprocessing (fullName, status)
- [ ] ✅ Avatar images display correctly
- [ ] ✅ Console logging shows transformation

### Error Handling
- [ ] ✅ Valid API loads data correctly
- [ ] ✅ Invalid API shows error message
- [ ] ✅ No JavaScript errors in console
- [ ] ✅ Graceful fallback behavior

### Performance
- [ ] ✅ Page size change works
- [ ] ✅ Loading states display
- [ ] ✅ Info text shows correct counts
- [ ] ✅ Responsive design works

## 🔗 Related Files

- **Documentation**: `../../API-PARAMETER-TRANSFORMATION-GUIDE.md`
- **Unit Tests**: `../../tests/api-parameter-transformation.test.js`
- **Core Library**: `../../core/ModernTable.js`

## 💡 Notes

- Semua test menggunakan **DummyJSON API** yang real
- Console logging aktif untuk debugging
- Test files ini untuk **manual testing** dan **demo purposes**
- Untuk **automated testing**, gunakan `npm test`