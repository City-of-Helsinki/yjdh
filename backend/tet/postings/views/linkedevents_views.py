from django.http import HttpResponse
from django.views.generic import View


class CreateOrReadView(View):
    http_method_names = ["get", "post"]

    def get(self, request):
        if request.user.is_authenticated:
            return HttpResponse("Not implemented", status=501)
        else:
            return HttpResponse("Unauthorized", status=401)

    def post(self, request):
        if request.user.is_authenticated:
            return HttpResponse("Not implemented", status=501)
        else:
            return HttpResponse("Unauthorized", status=401)


class EditOrDeleteView(View):
    http_method_names = ["put", "delete"]

    def put(self, request, **kwargs):
        if request.user.is_authenticated:
            return HttpResponse("Not implemented", status=501)
        else:
            return HttpResponse("Unauthorized", status=401)

    def delete(self, request, **kwargs):
        if request.user.is_authenticated:
            return HttpResponse("Not implemented", status=501)
        else:
            return HttpResponse("Unauthorized", status=401)
