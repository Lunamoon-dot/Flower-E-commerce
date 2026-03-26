async function testLogin() {
  try {
    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (!response.ok) {
        console.error('Error response status:', response.status);
        console.error('Error response data:', data);
      } else {
        console.log('Login successful:', data);
      }
    } else {
      const text = await response.text();
      console.error('Error response status:', response.status);
      console.error('Error response text:', text);
    }
  } catch (error) {
    console.error('Network Error details:', error);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
  }
}

testLogin();
