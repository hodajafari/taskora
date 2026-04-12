from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return {
            "success": False,
            "error": response.data
        }

    return {
        "success": False,
        "error": "Server error"
    }