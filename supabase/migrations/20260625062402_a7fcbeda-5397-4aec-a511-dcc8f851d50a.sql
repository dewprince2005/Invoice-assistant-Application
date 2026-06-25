
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.primary_role(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

-- Storage policies on the invoices bucket
CREATE POLICY "invoice files: vendor read own" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'invoices' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'ADMIN')
      OR public.has_role(auth.uid(), 'FINANCE')
    )
  );

CREATE POLICY "invoice files: vendor upload own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'invoices' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "invoice files: vendor delete own draft" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'invoices' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'ADMIN')
    )
  );
