FROM mcr.microsoft.com/dotnet/sdk:latest
WORKDIR /usr/src/app
RUN dotnet tool install -g dotnet-script
ENV PATH="$PATH:/root/.dotnet/tools"
CMD ["dotnet-script", "temp.cs"]