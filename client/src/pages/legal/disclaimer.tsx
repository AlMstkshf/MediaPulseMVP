import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRtlDirection } from '@/lib/rtl-helper';

const Disclaimer = () => {
  const { t } = useTranslation();
  const { isRtl } = useRtlDirection();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto my-8">
        <Card>
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('legal.disclaimer')}
            </CardTitle>
          </CardHeader>
          <CardContent className={isRtl ? 'text-right' : 'text-left'}>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.disclaimerIntro')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.disclaimerIntroDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.accuracy')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.accuracyDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.externalLinks')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.externalLinksDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.limitation')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.limitationDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.aiDisclaimer')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.aiDisclaimerDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.copyright')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.copyrightDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.contact')}</h2>
                <p className="text-gray-700">
                  {t('legal.contactDisclaimerDesc')}
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Email:</strong> legal@rhal.com
                </p>
              </section>

              <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-500">
                  {t('legal.lastUpdated')}: {t('legal.dateUpdated')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Disclaimer;