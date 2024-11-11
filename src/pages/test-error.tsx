import React from 'react';

const TestErrorPage: React.FC = () => {
    throw new Error('This is a test error');

    return <div>This is a test error page</div>;
}

export default TestErrorPage;