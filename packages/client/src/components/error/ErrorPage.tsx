export default function ErrorPage() {
    return (
        <div className='bg-error-50 flex h-screen items-center justify-center'>
            <div className='text-center'>
                <h1 className='text-error-400 text-6xl font-bold'>500</h1>
                <h2 className='text-error-500 mt-4 text-2xl font-semibold'>
                    Server Error
                </h2>
                <p className='text-error-500 mt-2'>
                    Something went wrong on our end.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className='bg-error-400 hover:bg-error-500 mt-6 cursor-pointer rounded-lg px-6 py-3 text-white duration-200'
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
