import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRtlDirection } from '@/lib/rtl-helper';

const TermsOfService = () => {
  const { t } = useTranslation();
  const { isRtl } = useRtlDirection();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto my-8">
        <Card>
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('legal.termsOfService')}
            </CardTitle>
          </CardHeader>
          <CardContent className={isRtl ? 'text-right' : 'text-left'}>
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.introduction')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.termsIntroduction')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.useOfService')}</h2>
                <p className="text-gray-700 mb-2">
                  {t('legal.useOfServiceDesc1')}
                </p>
                <p className="text-gray-700 mb-4">
                  {t('legal.useOfServiceDesc2')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.privacy')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.privacyDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.intellectualProperty')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.intellectualPropertyDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.termination')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.terminationDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.governing')}</h2>
                <p className="text-gray-700 mb-4">
                  {t('legal.governingDesc')}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">{t('legal.contact')}</h2>
                <p className="text-gray-700">
                  {t('legal.contactDesc')}
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

export default TermsOfService;