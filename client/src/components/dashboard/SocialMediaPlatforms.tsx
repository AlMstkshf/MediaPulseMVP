
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface PlatformStats {
  platform: string;
  count: number;
  active: boolean;
  lastActive: string;
}

export default function SocialMediaPlatforms() {
  const { t } = useTranslation();
  const { data: platforms, isLoading } = useQuery<PlatformStats[]>({
    queryKey: ['/api/social-posts/count-by-platform'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/social-posts/count-by-platform');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-[#cba344] border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {platforms?.map((platform) => (
        <Card key={platform.platform}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg capitalize">{platform.platform}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('social.postCount')}:</span>
                <span className="font-medium">{platform.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('social.status')}:</span>
                <span className={`font-medium ${platform.active ? 'text-green-500' : 'text-gray-500'}`}>
                  {platform.active ? t('social.active') : t('social.inactive')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('social.lastActive')}:</span>
                <span className="font-medium">{platform.lastActive}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
